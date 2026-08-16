import { CANONICAL_FIELD_DICTIONARY, FieldMappingRule } from "../dictionary/fieldDictionary";
import { FormFieldInput } from "../schemas/formSchemas";
import { ProfileService } from "@/modules/m02-profile/services/profileService";
import { DocumentVaultService } from "@/modules/m03-document-vault/services/documentVaultService";

export interface MappedFieldPlanItem {
  fieldIdentifier: string;
  label?: string;
  canonicalName: string;
  category: string;
  mappedValue: string | null;
  confidenceScore: number;
  confidenceBadge: "HIGH_CONFIDENCE (100%)" | "MEDIUM_CONFIDENCE (80%)" | "MISSING_VALUE (0%)";
  sourceModule: "M01 Identity" | "M02 Master Profile" | "M03 Document Vault" | "Not Found";
  isRequired: boolean;
  validationPassed: boolean;
}

export interface PreFillPlanResult {
  targetPortal: string;
  totalFieldsCount: number;
  successfullyMappedCount: number;
  missingRequiredCount: number;
  overallFormReadinessScore: number;
  plan: MappedFieldPlanItem[];
}

export const PORTAL_STANDARD_SCHEMAS: Record<string, FormFieldInput[]> = {
  Workday: [
    { fieldIdentifier: "workday.applicantName", label: "Full Name", inputType: "text", isRequired: true },
    { fieldIdentifier: "user.email", label: "Email Address", inputType: "text", isRequired: true },
    { fieldIdentifier: "personal.phone", label: "Phone Number", inputType: "text", isRequired: true },
    { fieldIdentifier: "workday.degree", label: "Highest Degree", inputType: "text", isRequired: true },
    { fieldIdentifier: "workday.school", label: "University", inputType: "text", isRequired: false },
    { fieldIdentifier: "workday.jobTitle", label: "Current Designation", inputType: "text", isRequired: false },
    { fieldIdentifier: "workday.company", label: "Current Employer", inputType: "text", isRequired: false },
    { fieldIdentifier: "vault.Resume", label: "Resume CV File", inputType: "file", isRequired: true },
  ],
  Greenhouse: [
    { fieldIdentifier: "greenhouse.candidate[first_name]", label: "First Name", inputType: "text", isRequired: true },
    { fieldIdentifier: "greenhouse.candidate[last_name]", label: "Last Name", inputType: "text", isRequired: true },
    { fieldIdentifier: "greenhouse.candidate[email]", label: "Email", inputType: "text", isRequired: true },
    { fieldIdentifier: "greenhouse.candidate[phone]", label: "Phone", inputType: "text", isRequired: true },
    { fieldIdentifier: "urls[linkedin]", label: "LinkedIn URL", inputType: "text", isRequired: false },
    { fieldIdentifier: "urls[github]", label: "GitHub URL", inputType: "text", isRequired: false },
    { fieldIdentifier: "greenhouse.resume", label: "Attach Resume", inputType: "file", isRequired: true },
  ],
  Lever: [
    { fieldIdentifier: "lever.name", label: "Full Name", inputType: "text", isRequired: true },
    { fieldIdentifier: "lever.email", label: "Email", inputType: "text", isRequired: true },
    { fieldIdentifier: "lever.phone", label: "Phone", inputType: "text", isRequired: true },
    { fieldIdentifier: "lever.urls[LinkedIn]", label: "LinkedIn", inputType: "text", isRequired: false },
    { fieldIdentifier: "lever.resume", label: "Resume/CV", inputType: "file", isRequired: true },
  ],
  GovtOTR: [
    { fieldIdentifier: "fullName", label: "Candidate Name", inputType: "text", isRequired: true },
    { fieldIdentifier: "fatherName", label: "Father's Name", inputType: "text", isRequired: true },
    { fieldIdentifier: "motherName", label: "Mother's Name", inputType: "text", isRequired: true },
    { fieldIdentifier: "dob", label: "Date of Birth", inputType: "text", isRequired: true },
    { fieldIdentifier: "gender", label: "Gender", inputType: "text", isRequired: true },
    { fieldIdentifier: "category", label: "Category", inputType: "text", isRequired: true },
    { fieldIdentifier: "aadhaar", label: "Aadhaar Number", inputType: "text", isRequired: true },
    { fieldIdentifier: "vault.Photograph", label: "Passport Photograph", inputType: "file", isRequired: true },
    { fieldIdentifier: "vault.Signature", label: "Signature Specimen", inputType: "file", isRequired: true },
  ],
};

export class FormIntelligenceService {
  /**
   * Helper to normalize DOM field identifiers (strips punctuation, dashes, underscores, brackets)
   */
  private static normalizeFieldIdentifier(id: string): string {
    return (id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  /**
   * Matches arbitrary DOM field input string against canonical dictionary rules
   * Uses both exact alias matching and normalized fuzzy token matching (e.g. "candidate.firstName" vs "first_name")
   */
  static matchCanonicalField(fieldIdentifier: string, label?: string): FieldMappingRule | null {
    const cleanId = fieldIdentifier.toLowerCase().trim();
    const cleanLabel = (label || "").toLowerCase().trim();
    const normId = this.normalizeFieldIdentifier(fieldIdentifier);
    const normLabel = this.normalizeFieldIdentifier(label || "");

    // 1. Exact or Normalized alias match
    for (const rule of CANONICAL_FIELD_DICTIONARY) {
      for (const alias of rule.aliases) {
        const normAlias = this.normalizeFieldIdentifier(alias);
        if (
          alias.toLowerCase() === cleanId ||
          alias.toLowerCase() === cleanLabel ||
          normAlias === normId ||
          (normLabel && normAlias === normLabel)
        ) {
          return rule;
        }
      }
    }

    // 2. Regex pattern match
    for (const rule of CANONICAL_FIELD_DICTIONARY) {
      if (
        rule.regexPattern.test(cleanId) ||
        (cleanLabel && rule.regexPattern.test(cleanLabel)) ||
        rule.regexPattern.test(normId) ||
        (normLabel && rule.regexPattern.test(normLabel))
      ) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Evaluates value from candidate profile or vault by profilePath
   */
  private static extractProfileValue(profile: any, user: any, vaultDocs: any[], profilePath: string): { value: string | null; sourceModule: MappedFieldPlanItem["sourceModule"] } {
    if (profilePath.startsWith("user.")) {
      const key = profilePath.replace("user.", "");
      return { value: user?.[key] || null, sourceModule: "M01 Identity" };
    }

    if (profilePath.startsWith("vault.")) {
      const category = profilePath.replace("vault.", "");
      const doc = vaultDocs.find((d: any) => d.category === category);
      return { value: doc ? `/api/v1/documents/${doc._id}` : null, sourceModule: "M03 Document Vault" };
    }

    if (profilePath.startsWith("personal.")) {
      const key = profilePath.replace("personal.", "");
      return { value: profile?.personal?.[key] || profile?.personalInfo?.[key] || null, sourceModule: "M02 Master Profile" };
    }

    if (profilePath.startsWith("education[0].")) {
      const key = profilePath.replace("education[0].", "");
      const edu = profile?.education?.[0];
      return { value: edu?.[key] || null, sourceModule: "M02 Master Profile" };
    }

    if (profilePath.startsWith("experience[0].")) {
      const key = profilePath.replace("experience[0].", "");
      const exp = profile?.experience?.[0];
      return { value: exp?.[key] || null, sourceModule: "M02 Master Profile" };
    }

    return { value: null, sourceModule: "Not Found" };
  }

  /**
   * Generates a validated Pre-fill Strategy Plan for target form fields
   */
  static async generatePreFillPlan(userId: string, targetPortal: string, formFields: FormFieldInput[]): Promise<PreFillPlanResult> {
    const { profile } = await ProfileService.getProfileByUserId(userId);
    const vaultDocs = await DocumentVaultService.getUserDocuments(userId);

    const planItems: MappedFieldPlanItem[] = [];
    let mappedCount = 0;
    let missingRequiredCount = 0;

    for (const field of formFields) {
      const matchedRule = this.matchCanonicalField(field.fieldIdentifier, field.label);

      if (matchedRule) {
        const { value, sourceModule } = this.extractProfileValue(profile, profile?.user, vaultDocs, matchedRule.profilePath);

        const hasValue = value !== null && value !== "";
        if (hasValue) mappedCount++;
        if (field.isRequired && !hasValue) missingRequiredCount++;

        planItems.push({
          fieldIdentifier: field.fieldIdentifier,
          label: field.label,
          canonicalName: matchedRule.canonicalName,
          category: matchedRule.category,
          mappedValue: value,
          confidenceScore: hasValue ? 100 : 0,
          confidenceBadge: hasValue ? "HIGH_CONFIDENCE (100%)" : "MISSING_VALUE (0%)",
          sourceModule: hasValue ? sourceModule : "Not Found",
          isRequired: field.isRequired,
          validationPassed: field.isRequired ? hasValue : true,
        });
      } else {
        if (field.isRequired) missingRequiredCount++;
        planItems.push({
          fieldIdentifier: field.fieldIdentifier,
          label: field.label,
          canonicalName: "Unmapped Custom Field",
          category: "General",
          mappedValue: null,
          confidenceScore: 0,
          confidenceBadge: "MISSING_VALUE (0%)",
          sourceModule: "Not Found",
          isRequired: field.isRequired,
          validationPassed: !field.isRequired,
        });
      }
    }

    const totalFields = formFields.length;
    const readinessScore = Math.round((mappedCount / (totalFields || 1)) * 100);

    return {
      targetPortal,
      totalFieldsCount: totalFields,
      successfullyMappedCount: mappedCount,
      missingRequiredCount,
      overallFormReadinessScore: readinessScore,
      plan: planItems,
    };
  }

  /**
   * Audits user profile readiness for a standard target portal schema (Workday, Greenhouse, Lever, GovtOTR)
   */
  static async auditPortalReadiness(userId: string, targetPortal: string): Promise<PreFillPlanResult> {
    const fields = PORTAL_STANDARD_SCHEMAS[targetPortal] || PORTAL_STANDARD_SCHEMAS["Workday"];
    return this.generatePreFillPlan(userId, targetPortal, fields);
  }
}
