import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    const { name, email, message, website } = req.body || {};

    // --------------------------------
    // Honeypot
    // --------------------------------

    if (website) {
      return res.status(400).json({
        success: false,
        message: "Spam detected.",
      });
    }

    // --------------------------------
    // Type validation
    // --------------------------------

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input.",
      });
    }

    // --------------------------------
    // Clean input
    // --------------------------------

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMessage = message.trim();

    // --------------------------------
    // Required fields
    // --------------------------------

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    // --------------------------------
    // Length limits
    // --------------------------------

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name is too long.",
      });
    }

    if (cleanEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: "Email is too long.",
      });
    }

    if (cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long.",
      });
    }

    // --------------------------------
    // Email validation
    // --------------------------------

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // --------------------------------
    // Escape user input
    // --------------------------------

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safeMessage = escapeHtml(cleanMessage);

    // --------------------------------
    // Send email
    // --------------------------------

    const { data, error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: [process.env.CONTACT_EMAIL],

      // When you press Reply, it replies to the visitor
      replyTo: cleanEmail,

      subject: `Portfolio message from ${cleanName}`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            color: #232b35;
          "
        >
          <h2>New portfolio message</h2>

          <p>
            <strong>Name:</strong>
            ${safeName}
          </p>

          <p>
            <strong>Email:</strong>
            ${safeEmail}
          </p>

          <hr />

          <p>
            <strong>Message:</strong>
          </p>

          <p style="line-height: 1.6;">
            ${safeMessage.replace(/\n/g, "<br>")}
          </p>
        </div>
      `,
    });

    // --------------------------------
    // Resend error
    // --------------------------------

    if (error) {
      console.error("Resend error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to send message.",
      });
    }

    console.log("Contact email sent:", data?.id);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
}
