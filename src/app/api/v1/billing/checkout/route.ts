import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { SaasBillingService } from "@/modules/m15-saas-billing/services/saasBillingService";
import { checkoutRequestSchema } from "@/modules/m15-saas-billing/schemas/billingSchemas";
import { AppError } from "@/lib/errors/AppError";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { targetTier } = checkoutRequestSchema.parse(body);

    const { subscription, invoice } = await SaasBillingService.processCheckoutUpgrade(payload.userId, targetTier);

    return NextResponse.json({
      success: true,
      data: { subscription, invoice },
      message: `Successfully upgraded to ${targetTier} plan!`,
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Unhandled Checkout Upgrade Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to process plan upgrade" } },
      { status: 500 }
    );
  }
}
