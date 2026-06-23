import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Champs manquants." },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "E-mail invalide." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!resendApiKey || !toEmail) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Configuration email manquante. Ajoute RESEND_API_KEY et CONTACT_TO_EMAIL dans les variables d’environnement.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const subject = `Nouveau message de ${name}`;

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [toEmail],
      subject,
      html: `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.4;">
          <h2 style="margin: 0 0 12px 0;">Nouveau message via ton portfolio</h2>
          <p style="margin: 0 0 8px 0;"><strong>Nom :</strong> ${name}</p>
          <p style="margin: 0 0 8px 0;"><strong>E-mail :</strong> ${email}</p>
          <p style="margin: 0;"><strong>Message :</strong></p>
          <pre style="white-space: pre-wrap; background: #f3f4f6; padding: 12px; border-radius: 10px;">${message}</pre>
        </div>
      `,
      replyTo: email,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message || "Erreur d’envoi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Requête invalide." },
      { status: 400 }
    );
  }
}




