import { NextResponse } from "next/server";
import { SocialJobIngestionService } from "@/modules/m05-job-discovery/services/socialJobIngestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ success: true, message: "Telegram Job Channel Webhook Listener Active" });
}

// Ingest Incoming Telegram Channel / Bot Job Post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messageText = body.messageText || body.message?.text || body.channel_post?.text;
    const groupName = body.groupName || body.channel_post?.chat?.title || "Telegram Job Channel";
    const senderName = body.senderName || body.message?.from?.first_name || "Telegram Bot";

    if (!messageText) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "No message text found in Telegram payload" } },
        { status: 400 }
      );
    }

    const result = await SocialJobIngestionService.ingestSocialJob({
      source: "TELEGRAM",
      groupName,
      senderName,
      messageText,
    });

    return NextResponse.json({
      success: true,
      message: "Telegram job alert ingested & matched to candidate profile successfully",
      data: result,
    });
  } catch (error) {
    console.error("Unhandled Telegram Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to ingest Telegram job" } },
      { status: 500 }
    );
  }
}
