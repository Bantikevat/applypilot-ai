import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { DocumentVaultService } from "@/modules/m03-document-vault/services/documentVaultService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const documents = await DocumentVaultService.getUserDocuments(userId, category);

    return NextResponse.json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    console.error("Unhandled Documents List Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch vault documents" } },
      { status: 500 }
    );
  }
}
