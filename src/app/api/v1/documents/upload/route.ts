import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { DocumentVaultService } from "@/modules/m03-document-vault/services/documentVaultService";
import { uploadMetadataSchema } from "@/modules/m03-document-vault/schemas/documentSchemas";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    let userId = "banti_kevat_default_user";

    if (token) {
      const payload = await AuthService.verifySessionToken(token);
      if (payload?.userId) {
        userId = payload.userId;
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string;
    const documentType = formData.get("documentType") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No file attached to upload request" } },
        { status: 400 }
      );
    }

    const validatedMetadata = uploadMetadataSchema.parse({ category, documentType });

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const doc = await DocumentVaultService.uploadDocument(
      userId,
      fileBuffer,
      file.name,
      file.type,
      validatedMetadata.category,
      validatedMetadata.documentType
    );

    return NextResponse.json(
      {
        success: true,
        data: { document: doc },
        message: "Document uploaded to Vault successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Document Upload Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to upload document" } },
      { status: 500 }
    );
  }
}
