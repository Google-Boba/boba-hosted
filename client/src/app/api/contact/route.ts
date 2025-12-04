import { NextResponse } from "next/server";
import { z } from "zod";
import validator from "validator";
import nodemailer from "nodemailer";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." }),
});

export async function POST(request: Request) {
  try {
    // Check origin
    const origin = request.headers.get("origin");
    const allowed = process.env.ALLOWED_ORIGIN;
    if (origin && allowed && origin !== allowed) {
      return NextResponse.json(
        { error: "Unauthorized request origin." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = contactSchema.parse(body);

    // Server-side sanitization
    const sanitizedData = {
      name: validator.escape(parsed.name.trim()),
      email:
        validator.normalizeEmail(parsed.email.trim()) || parsed.email.trim(),
      message: validator.escape(parsed.message.trim()),
    };

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // Use the new SMTP_SECURE variable
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission from ${sanitizedData.name}`,
      text: `
You have received a new message from your website contact form.

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Message:
${sanitizedData.message}
      `,
      html: `
        <p>You have received a new message from your website contact form.</p>
        <p><strong>Name:</strong> ${sanitizedData.name}</p>
        <p><strong>Email:</strong> ${sanitizedData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitizedData.message.replace(/\n/g, "<br>")}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return NextResponse.json(
      { message: "Your message has been sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
