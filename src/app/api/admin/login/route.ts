import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const adminEmail = (
      process.env.ADMIN_EMAIL ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      "azizfaiq18@gmail.com"
    )
      .toLowerCase()
      .trim();

    const adminPassword = (
      process.env.ADMIN_PASSWORD ||
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      ""
    ).trim();

    const inputEmail = String(email).toLowerCase().trim();
    const inputPassword = String(password).trim();

    // Check credentials against server-side environment variables
    if (adminPassword && inputEmail === adminEmail && inputPassword === adminPassword) {
      return NextResponse.json({
        success: true,
        user: {
          email: adminEmail,
          uid: "admin-session-active",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid email or password. Please verify your credentials." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin login API error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service encountered an unexpected error." },
      { status: 500 }
    );
  }
}
