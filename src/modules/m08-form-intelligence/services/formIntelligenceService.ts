import { CANONICAL_FIELD_DICTIONARY, FieldMappingRule } from "../dictionary/fieldDictionary";
import { FormFieldInput } from "../schemas/formSchemas";
import { ProfileService } from "@/modules/m02-profile/services/profileService";
import { DocumentVaultService } from "@/modules/m03-document-vault/services/documentVaultService";
import { AuthService } from "@/modules/m01-identity/services/authService";

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

export class FormIntelligenceService {
  /**
   * Matches arbitrary DOM field input string against canonical dictionary rules
   */
  static matchCanonicalField(fieldIdentifier: string, label?: string): FieldMappingRule | null {
    const cleanId = fieldIdentifier.toLowerCase().trim();
    const cleanLabel = (label || "").toLowerCase().trim();

    // 1. Exact alias match
    for (const rule of CANONICAL_FIELD_DICTIONARY) {
      if (rule.aliases.some((alias) => alias.toLowerCase() === cleanId || alias.toLowerCase() === cleanLabel)) {
        return rule;
      }
    }

    // 2. Regex pattern match
    for (const rule of CANONICAL_FIELD_DICTIONARY) {
      if (rule.regexPattern.test(cleanId) || (cleanLabel && rule.regexPattern.test(cleanLabel))) {
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

    // Profile path extraction (e.g. personal.fullName, education[0].degree)
    if (profilePath.startsWith("personal.")) {
      const key = profilePath.replace("personal.", "");
      return { value: profile?.personal?.[key] || null, sourceModule: "M02 Master Profile" };
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
}
