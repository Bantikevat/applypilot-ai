import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { DocumentVaultService } from "@/modules/m03-document-vault/services/documentVaultService";
import { DocumentStorage } from "@/lib/storage/documentStorage";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { documentId: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const payload = await AuthService.verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session token" } },
        { status: 401 }
      );
    }

    const doc = await DocumentVaultService.getDocumentById(payload.userId, params.documentId);

    if (!doc.storagePath) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Document file path is missing" } },
        { status: 404 }
      );
    }

    const fileBuffer = await DocumentStorage.readFile(doc.storagePath);
    if (!fileBuffer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Physical document file not found on disk" } },
        { status: 404 }
      );
    }

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${doc.originalFileName || "document"}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Document Stream Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to stream document" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { documentId: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const payload = await AuthService.verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session token" } },
        { status: 401 }
      );
    }

    await DocumentVaultService.deleteDocument(payload.userId, params.documentId);

    return NextResponse.json({
      success: true,
      message: "Document deleted from Vault successfully",
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Document Delete Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to delete document" } },
      { status: 500 }
    );
  }
}
