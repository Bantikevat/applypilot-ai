import { NextResponse } from "next/server";
import { SocialJobIngestionService } from "@/modules/m05-job-discovery/services/socialJobIngestionService";

export const dynamic = "force-dynamic";

// Webhook Verification (WhatsApp Cloud API)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === "applypilot_whatsapp_verify_token") {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ success: true, message: "WhatsApp Job Ingestion Webhook Listener Active" });
}

// Ingest Incoming WhatsApp Group Job Post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messageText = body.messageText || body.text || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
    const groupName = body.groupName || "WhatsApp Tech Jobs Group";
    const senderName = body.senderName || "WhatsApp Contact";

    if (!messageText) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No message text found in payload" } },
        { status: 400 }
      );
    }

    const result = await SocialJobIngestionService.ingestSocialJob({
      source: "WHATSAPP",
      groupName,
      senderName,
      messageText,
    });

    return NextResponse.json({
      success: true,
      message: "WhatsApp job message ingested & matched to candidate profile successfully",
      data: result,
    });
  } catch (error) {
    console.error("Unhandled WhatsApp Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to ingest WhatsApp job" } },
      { status: 500 }
    );
  }
}
