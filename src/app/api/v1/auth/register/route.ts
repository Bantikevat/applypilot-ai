import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerSchema } from "@/modules/m01-identity/schemas/authSchemas";
import { AuthService, AUTH_COOKIE_NAME } from "@/modules/m01-identity/services/authService";
import { AppError } from "@/lib/errors/AppError";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedInput = registerSchema.parse(body);

    const { user, token } = await AuthService.registerUser(validatedInput);

    const response = NextResponse.json(
      {
        success: true,
        data: { user },
        message: "Account registered successfully",
      },
      { status: 201 }
    );

    // Set HttpOnly, Secure Session Cookie
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
            message: "Validation failed for request body",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              issue: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    console.error("Unhandled Register Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected server error occurred during registration.",
        },
      },
      { status: 500 }
    );
  }
}

