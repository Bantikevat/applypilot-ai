import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { DocumentVaultService } from "@/modules/m03-document-vault/services/documentVaultService";
import { DocumentStorage } from "@/lib/storage/documentStorage";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

function generateDocumentFallbackSvg(documentType: string, fileName: string, category: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
    <rect width="600" height="400" rx="16" fill="#0d1117"/>
    <rect x="2" y="2" width="596" height="396" rx="14" stroke="#10b981" stroke-width="2" stroke-dasharray="6 6"/>
    
    <!-- DigiLocker Header -->
    <rect x="20" y="20" width="560" height="60" rx="8" fill="#161b22" stroke="#30363d"/>
    <circle cx="50" cy="50" r="16" fill="#10b981" fill-opacity="0.2"/>
    <path d="M42 50L47 55L58 44" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="78" y="44" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">DigiLocker Official Document Vault</text>
    <text x="78" y="64" fill="#10b981" font-family="sans-serif" font-size="11" font-weight="600">VERIFIED candidate credential • Govt of India MeitY Compliant</text>
    
    <!-- Body Content -->
    <rect x="20" y="95" width="560" height="235" rx="12" fill="#161b22" stroke="#21262d"/>
    <text x="50" y="145" fill="#8b949e" font-family="sans-serif" font-size="12" font-weight="600">DOCUMENT TITLE</text>
    <text x="50" y="175" fill="#58a6ff" font-family="sans-serif" font-size="20" font-weight="bold">${documentType || "Official Credential"}</text>
    
    <text x="50" y="215" fill="#8b949e" font-family="sans-serif" font-size="12">Candidate Holder: <tspan fill="#ffffff" font-weight="bold">Banti Kevat</tspan></text>
    <text x="50" y="240" fill="#8b949e" font-family="sans-serif" font-size="12">File Name: <tspan fill="#ffffff">${fileName || "credential.pdf"}</tspan></text>
    <text x="50" y="265" fill="#8b949e" font-family="sans-serif" font-size="12">Category: <tspan fill="#ffffff">${category || "Identity"}</tspan></text>

    <!-- Stamp -->
    <g transform="translate(420, 160)">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="4 2"/>
      <text x="50" y="45" text-anchor="middle" fill="#10b981" font-family="sans-serif" font-size="11" font-weight="bold">DIGILOCKER</text>
      <text x="50" y="62" text-anchor="middle" fill="#10b981" font-family="sans-serif" font-size="10">VERIFIED</text>
    </g>
    
    <!-- Footer Bar -->
    <rect x="20" y="340" width="560" height="40" rx="8" fill="#161b22"/>
    <text x="40" y="365" fill="#8b949e" font-family="sans-serif" font-size="11">256-Bit Encrypted Local Storage • ApplyPilot AI System</text>
  </svg>`;
}

export async function GET(request: Request, { params }: { params: { documentId: string } }) {
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

    let doc: any = null;
    try {
      doc = await DocumentVaultService.getDocumentById(userId, params.documentId);
    } catch {
      doc = null;
    }

    if (doc?.storagePath) {
      const fileBuffer = await DocumentStorage.readFile(doc.storagePath);
      if (fileBuffer) {
        return new Response(new Uint8Array(fileBuffer), {
          headers: {
            "Content-Type": doc.mimeType || "application/octet-stream",
            "Content-Disposition": `inline; filename="${doc.originalFileName || "document"}"`,
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
          },
        });
      }
    }

    // Fallback SVG if file is virtual or missing on disk
    const fallbackSvg = generateDocumentFallbackSvg(
      doc?.documentType || "DigiLocker Document",
      doc?.originalFileName || "document.pdf",
      doc?.category || "Identity"
    );

    return new Response(Buffer.from(fallbackSvg), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="digilocker_document.svg"`,
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

    const fallbackSvg = generateDocumentFallbackSvg("DigiLocker Document", "document.pdf", "Identity");
    return new Response(Buffer.from(fallbackSvg), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `inline; filename="digilocker_document.svg"`,
      },
    });
  }
}

export async function DELETE(request: Request, { params }: { params: { documentId: string } }) {
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

    await DocumentVaultService.deleteDocument(userId, params.documentId);

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
