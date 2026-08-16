import { NextResponse } from "next/server";
import { FormIntelligenceService } from "@/modules/m08-form-intelligence/services/formIntelligenceService";
import { mapFieldsRequestSchema } from "@/modules/m08-form-intelligence/schemas/formSchemas";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fieldIdentifiers } = mapFieldsRequestSchema.parse(body);

    const mappings = fieldIdentifiers.map((id) => {
      const rule = FormIntelligenceService.matchCanonicalField(id);
      return {
        fieldIdentifier: id,
        canonicalName: rule?.canonicalName || "Unmapped Custom Field",
        category: rule?.category || "General",
        isMapped: !!rule,
      };
    });

    return NextResponse.json({
      success: true,
      data: { mappings },
    });
  } catch (error) {
    console.error("Unhandled Map Fields Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to map form fields" } },
      { status: 500 }
    );
  }
}
