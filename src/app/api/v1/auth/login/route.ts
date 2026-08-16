import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { loginSchema } from "@/modules/m01-identity/schemas/authSchemas";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { checkRateLimit } from "@/modules/m01-identity/services/rateLimiter";
import { AppError } from "@/lib/errors/AppError";

export async function POST(request: Request) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || "client_ip";
    const body = await request.json();

    // Check rate limit per IP & email combination
    const rateCheck = checkRateLimit(`login_${clientIp}_${body.email || ""}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: `Too many failed login attempts. Please retry after ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`,
          },
        },
        { status: 429 }
      );
    }

    const validatedInput = loginSchema.parse(body);
    const { user, token } = await AuthService.loginUser(validatedInput);

    const response = NextResponse.json(
      {
        success: true,
        data: { user },
        message: "Logged in successfully",
      },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed for login payload",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              issue: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    console.error("Unhandled Login Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected server error occurred during login.",
        },
      },
      { status: 500 }
    );
  }
}

