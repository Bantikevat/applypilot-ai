import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
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
  injectionScript: string;
  createdAt: Date;
  updatedAt: Date;
}

const activeAssistantSessions = new Map<string, AssistantSession>();

const SAMPLE_PORTAL_FORM_FIELDS = [
  { fieldIdentifier: "full_name", label: "Full Name", inputType: "text", isRequired: true },
  { fieldIdentifier: "email_address", label: "Email Address", inputType: "text", isRequired: true },
  { fieldIdentifier: "mobile_no", label: "Mobile Number", inputType: "text", isRequired: true },
  { fieldIdentifier: "dob", label: "Date of Birth", inputType: "text", isRequired: true },
  { fieldIdentifier: "highest_qualification", label: "Degree / Qualification", inputType: "text", isRequired: true },
  { fieldIdentifier: "upload_resume", label: "Resume CV Attachment", inputType: "file", isRequired: true },
  { fieldIdentifier: "passport_photo", label: "Passport Photo File", inputType: "file", isRequired: true },
];

export class BrowserAssistantService {
  /**
   * Initiates a new client-assisted browser application session
   */
  static async startSession(userId: string, targetPortalUrl: string, portalName: string, jobId?: string): Promise<AssistantSession> {
    const sessionId = `asst_sess_${Date.now()}`;

    // Generate Pre-fill Plan via Module M08 Form Intelligence
    const preFillPlan = await FormIntelligenceService.generatePreFillPlan(
      userId,
      portalName,
      SAMPLE_PORTAL_FORM_FIELDS
    );

    const session: AssistantSession = {
      sessionId,
      userId,
      jobId,
      targetPortalUrl,
      portalName,
      currentStep: "AWAITING_HUMAN_REVIEW", // Pauses at HITL Gate by default
      hitlProtectionActive: true,
      preFillPlan,
      candidateApproved: false,
      injectionScript: this.generateDOMInjectionScript(preFillPlan.plan),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    activeAssistantSessions.set(sessionId, session);
    return session;
  }

  /**
   * Candidate HITL Confirmation Gate: Updates field overrides & approves form injection
   */
  static async confirmHumanStep(sessionId: string, userId: string, modifiedFields?: Record<string, string>, candidateApproved = true): Promise<AssistantSession> {
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
        }
      }
    }

    session.candidateApproved = candidateApproved;
    session.currentStep = candidateApproved ? "APPROVED_FOR_SUBMIT" : "AWAITING_HUMAN_REVIEW";
    session.injectionScript = this.generateDOMInjectionScript(session.preFillPlan.plan);
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
      "// ApplyPilot AI — Browser Application Assistant Auto-Fill Injection",
      "// HITL Safeguard: Form submission and payment gateways require explicit human click.",
      "(function preFillTargetForm() {",
      "  const plan = " + JSON.stringify(planItems, null, 2) + ";",
      "  plan.forEach(item => {",
      "    if (!item.mappedValue) return;",
      "    const el = document.querySelector(`[name='${item.fieldIdentifier}'], #${item.fieldIdentifier}`);",
      "    if (el) {",
      "      el.value = item.mappedValue;",
      "      el.dispatchEvent(new Event('input', { bubbles: true }));",
      "      el.dispatchEvent(new Event('change', { bubbles: true }));",
      "      console.log(`[ApplyPilot AI] Pre-filled ${item.fieldIdentifier}`);",
      "    }",
      "  });",
      "  console.log('[ApplyPilot AI] Form pre-fill completed cleanly. Please review before final submit!');",
      "})();",
    ];
    return scriptLines.join("\n");
  }
}
