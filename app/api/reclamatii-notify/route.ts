import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'new_complaint') {
      const { to, numeClient, numarReclamatie, statusLink } = body;
      await transporter.sendMail({
        from: `"Naturen" <${process.env.GMAIL_USER}>`,
        to,
        subject: `Reclamația dvs. a fost înregistrată — ${numarReclamatie}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
            <div style="background:linear-gradient(135deg,#e11d48,#be123c);padding:32px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px">Reclamație înregistrată</h1>
            </div>
            <div style="padding:32px">
              <p style="color:#334155;font-size:16px">Bună ziua, <strong>${numeClient}</strong>,</p>
              <p style="color:#64748b">Reclamația dvs. a fost înregistrată cu numărul <strong style="color:#e11d48">${numarReclamatie}</strong>. Echipa noastră o va analiza în cel mai scurt timp.</p>
              <div style="text-align:center;margin:32px 0">
                <a href="${statusLink}" style="background:#e11d48;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
                  Verificați statusul reclamației
                </a>
              </div>
              <p style="color:#94a3b8;font-size:13px;text-align:center">Puteți urmări evoluția reclamației dvs. oricând accesând linkul de mai sus.</p>
            </div>
          </div>
        `,
      });
    } else if (type === 'assignment') {
      const { to, assigneeName, assignedBy, numarReclamatie, numeClient, ticketLink } = body;
      await transporter.sendMail({
        from: `"Naturen" <${process.env.GMAIL_USER}>`,
        to,
        subject: `V-a fost atribuită reclamația ${numarReclamatie}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
            <div style="background:#0f172a;padding:24px 32px">
              <h2 style="color:#fff;margin:0;font-size:18px">Reclamație atribuită</h2>
            </div>
            <div style="padding:32px">
              <p style="color:#334155">Bună ziua, <strong>${assigneeName}</strong>,</p>
              <p style="color:#64748b">Reclamația <strong>${numarReclamatie}</strong> (client: ${numeClient}) v-a fost atribuită de <strong>${assignedBy}</strong>.</p>
              <div style="text-align:center;margin:28px 0">
                <a href="${ticketLink}" style="background:#4f46e5;color:#fff;padding:11px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
                  Deschide reclamația
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } else if (type === 'mention') {
      const { to, mentionedName, mentionedBy, numarReclamatie, commentContent, ticketLink } = body;
      await transporter.sendMail({
        from: `"Naturen" <${process.env.GMAIL_USER}>`,
        to,
        subject: `Ați fost menționat în reclamația ${numarReclamatie}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
            <div style="background:#0f172a;padding:24px 32px">
              <h2 style="color:#fff;margin:0;font-size:18px">Mențiune nouă</h2>
            </div>
            <div style="padding:32px">
              <p style="color:#334155">Bună ziua, <strong>${mentionedName}</strong>,</p>
              <p style="color:#64748b"><strong>${mentionedBy}</strong> v-a menționat într-un comentariu pe reclamația <strong>${numarReclamatie}</strong>:</p>
              <div style="background:#f8fafc;border-left:3px solid #e11d48;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0">
                <p style="color:#334155;margin:0;font-style:italic">"${commentContent}"</p>
              </div>
              <div style="text-align:center;margin:24px 0">
                <a href="${ticketLink}" style="background:#4f46e5;color:#fff;padding:11px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
                  Deschide reclamația
                </a>
              </div>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('reclamatii-notify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
