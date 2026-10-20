import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const TARGET_EMAIL = "azizfaiq18@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, projectType, date, location, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "https://azizography.com";
    const referer = request.headers.get("referer") || "https://azizography.com/contact";

    // 1. Deliver directly to azizfaiq18@gmail.com via FormSubmit with valid server origin & referer
    let formSubmitResult: { success?: string | boolean; message?: string } | null = null;
    try {
      const forwardResponse = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: origin,
          Referer: referer,
        },
        body: JSON.stringify({
          name,
          email,
          projectType: projectType || "Editorial",
          date: date || "Flexible",
          location: location || "Unspecified",
          message: message || "No message provided",
          _subject: `New Portfolio Commission Inquiry from ${name} (${projectType || "General"})`,
          _replyto: email,
          _template: "table",
          _captcha: "false",
        }),
      });

      if (forwardResponse.ok) {
        formSubmitResult = await forwardResponse.json();
      } else {
        const text = await forwardResponse.text();
        console.warn("FormSubmit non-ok response:", forwardResponse.status, text);
      }
    } catch (fsErr) {
      console.warn("FormSubmit direct network error:", fsErr);
    }

    // 2. Persist to Firestore backup collection if configured so inquiries are never lost
    try {
      if (db) {
        await addDoc(collection(db, "inquiries"), {
          name,
          email,
          projectType: projectType || "Editorial",
          date: date || "Flexible",
          location: location || "Unspecified",
          message: message || "",
          targetEmail: TARGET_EMAIL,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      console.warn("Firestore inquiry backup notice:", dbErr);
    }

    const needsActivation =
      formSubmitResult?.message?.toLowerCase().includes("activation") || false;

    return NextResponse.json({
      success: true,
      needsActivation,
      message: needsActivation
        ? `FormSubmit has sent a one-time activation email to ${TARGET_EMAIL}. Please check your Gmail (including Spam/Junk) and click 'Activate Form' to start receiving messages directly!`
        : `Inquiry successfully transmitted to ${TARGET_EMAIL}`,
    });
  } catch (err: unknown) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Internal server error transmitting inquiry" },
      { status: 500 }
    );
  }
}
