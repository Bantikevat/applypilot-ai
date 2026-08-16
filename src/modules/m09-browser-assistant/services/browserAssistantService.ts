import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
import { FormFieldInput } from "@/modules/m08-form-intelligence/schemas/formSchemas";
import { AssistantStep } from "../schemas/assistantSchemas";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";

export interface AssistantSession {
  sessionId: string;
  userId: string;
  jobId?: string;
  targetPortalUrl: string;
  portalName: string;
  currentStep: AssistantStep;
  hitlProtectionActive: boolean;
  preFillPlan: any;
  candidateApproved: boolean;
  injectionScript: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const activeAssistantSessions = new Map<string, AssistantSession>();
const portalSessionCooldowns = new Map<string, number>();

const DEFAULT_PORTAL_FORM_FIELDS: FormFieldInput[] = [
  { fieldIdentifier: "full_name", label: "Full Name", isRequired: true },
  { fieldIdentifier: "user.email", label: "Email Address", isRequired: true },
  { fieldIdentifier: "personal.phone", label: "Mobile Number", isRequired: true },
  { fieldIdentifier: "dob", label: "Date of Birth", isRequired: true },
  { fieldIdentifier: "highest_qualification", label: "Degree / Qualification", isRequired: true },
  { fieldIdentifier: "vault.Resume", label: "Resume CV Attachment", isRequired: true },
  { fieldIdentifier: "vault.Photograph", label: "Passport Photo File", isRequired: true },
];

export class BrowserAssistantService {
  /**
   * Initiates a new client-assisted browser application session
   * Enforces server-side HITL protection (injectionScript = null) and per-portal per-user rate limiting (60s cooldown)
   */
  static async startSession(
    userId: string,
    targetPortalUrl: string,
    portalName: string,
    jobId?: string,
    customFormFields?: FormFieldInput[]
  ): Promise<AssistantSession> {
    // 1. Rate Limiter Guard: Enforce 60s cooldown per user per portal to prevent spam / portal bans
    const rateLimitKey = `${userId}:${portalName.toLowerCase().trim()}`;
    const lastSessionTime = portalSessionCooldowns.get(rateLimitKey) || 0;
    const cooldownMs = 60 * 1000;
    const now = Date.now();

    if (now - lastSessionTime < cooldownMs && process.env.NODE_ENV !== "test") {
      const waitSec = Math.ceil((cooldownMs - (now - lastSessionTime)) / 1000);
      throw new ValidationError(
        `Rate limit safety cool-down active for ${portalName}. Please wait ${waitSec} seconds before starting another application session.`
      );
    }
    portalSessionCooldowns.set(rateLimitKey, now);

    const sessionId = `asst_sess_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const fieldsToUse = Array.isArray(customFormFields) && customFormFields.length > 0
      ? customFormFields
      : DEFAULT_PORTAL_FORM_FIELDS;

    // Generate Pre-fill Plan via Module M08 Form Intelligence
    const preFillPlan = await FormIntelligenceService.generatePreFillPlan(
      userId,
      portalName,
      fieldsToUse
    );

    // SERVER-SIDE HITL PROTECTION: injectionScript is explicitly set to NULL until human confirmation
    const session: AssistantSession = {
      sessionId,
      userId,
      jobId,
      targetPortalUrl,
      portalName,
      currentStep: "AWAITING_HUMAN_REVIEW", // Mandatory HITL Safety Gate Pause
      hitlProtectionActive: true,
      preFillPlan,
      candidateApproved: false,
      injectionScript: null, // Server locks payload until explicit candidate approval
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    activeAssistantSessions.set(sessionId, session);
    return session;
  }

  /**
   * Candidate HITL Confirmation Gate: Updates field overrides, validates server lock, & compiles DOM injection script
   */
  static async confirmHumanStep(
    sessionId: string,
    userId: string,
    modifiedFields?: Record<string, string>,
    candidateApproved = true
  ): Promise<AssistantSession> {
    const session = activeAssistantSessions.get(sessionId);

    if (!session) {
      throw new NotFoundError(`Assistant session '${sessionId}' not found.`);
    }

    if (session.userId !== userId) {
      throw new ValidationError("Unauthorized access to requested assistant session.");
    }

    // Apply candidate manual edits if provided
    if (modifiedFields && Object.keys(modifiedFields).length > 0) {
      for (const item of session.preFillPlan.plan) {
        if (modifiedFields[item.fieldIdentifier] !== undefined) {
          item.mappedValue = modifiedFields[item.fieldIdentifier];
          item.confidenceScore = 100;
          item.confidenceBadge = "HIGH_CONFIDENCE (100%) (Candidate Edit)";
          item.sourceModule = "M02 Master Profile";
        }
      }
    }

    session.candidateApproved = candidateApproved;
    session.currentStep = candidateApproved ? "APPROVED_FOR_SUBMIT" : "AWAITING_HUMAN_REVIEW";
    // SERVER RELEASES INJECTION PAYLOAD ONLY AFTER EXPLICIT CANDIDATE APPROVAL
    session.injectionScript = candidateApproved ? this.generateDOMInjectionScript(session.preFillPlan.plan) : null;
    session.updatedAt = new Date();

    return session;
  }

  /**
   * Retrieves active assistant session state
   */
  static async getSession(sessionId: string, userId: string): Promise<AssistantSession> {
    const session = activeAssistantSessions.get(sessionId);
    if (!session) {
      throw new NotFoundError(`Assistant session '${sessionId}' not found.`);
    }
    if (session.userId !== userId) {
      throw new ValidationError("Unauthorized access to requested assistant session.");
    }
    return session;
  }

  /**
   * Generates DOM auto-fill injection script payload
   */
  private static generateDOMInjectionScript(planItems: any[]): string {
    const scriptLines = [
      "// ApplyPilot AI — Browser Application Assistant Auto-Fill Injection Script",
      "// HITL Safeguard: Final form submission and payment processing REQUIRE explicit candidate action.",
      "(function preFillTargetForm() {",
      "  const plan = " + JSON.stringify(planItems, null, 2) + ";",
      "  plan.forEach(item => {",
      "    if (!item.mappedValue) return;",
      "    const el = document.querySelector(`[name='${item.fieldIdentifier}'], #${item.fieldIdentifier}, [data-automation-id='${item.fieldIdentifier}']`);",
      "    if (el) {",
      "      el.value = item.mappedValue;",
      "      el.dispatchEvent(new Event('input', { bubbles: true }));",
      "      el.dispatchEvent(new Event('change', { bubbles: true }));",
      "      console.log(`[ApplyPilot AI] Pre-filled field: ${item.canonicalName} (${item.fieldIdentifier})`);",
      "    }",
      "  });",
      "  console.log('[ApplyPilot AI] Auto-fill completed cleanly. Please review all fields before clicking Submit.');",
      "})();",
    ];
    return scriptLines.join("\n");
  }
}
