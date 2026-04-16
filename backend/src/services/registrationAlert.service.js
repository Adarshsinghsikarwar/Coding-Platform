import { config } from "../config/config.js";
import { sendEmail } from "./email.service.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_ADMIN_ALERT_EMAIL = "adarshsikarwar543@gmail.com";

const normalizeAdminEmail = (value) => {
  const raw = String(value || "").trim();
  if (EMAIL_REGEX.test(raw)) return raw;

  // Fix common typo: "namegmail.com" -> "name@gmail.com"
  if (raw.endsWith("gmail.com") && !raw.includes("@")) {
    const fixed = raw.replace("gmail.com", "@gmail.com");
    if (EMAIL_REGEX.test(fixed)) return fixed;
  }

  return null;
};

export const getAdminAlertEmail = () => {
  return (
    normalizeAdminEmail(config.REGISTRATION_ALERT_EMAIL) ||
    normalizeAdminEmail(config.GOOGLE_USER) ||
    DEFAULT_ADMIN_ALERT_EMAIL
  );
};

export const sendWrongEmailRegistrationAlert = async ({
  attemptedEmail,
  reason,
  ip,
  userAgent,
  source,
}) => {
  try {
    const to = getAdminAlertEmail();
    const attempted = String(attemptedEmail || "(missing)").trim();
    const why = String(reason || "Invalid email format").trim();

    await sendEmail(
      to,
      "Registration Status Alert",
      `This user has not been registered for wrong email: ${attempted}`,
      `<p><strong>Registration Status:</strong> This user has not been registered for wrong email.</p>
       <p><strong>Email:</strong> ${attempted}</p>
       <p><strong>Reason:</strong> ${why}</p>
       <p><strong>Source:</strong> ${source || "unknown"}</p>
       <p><strong>IP:</strong> ${ip || "unknown"}</p>
       <p><strong>User Agent:</strong> ${userAgent || "unknown"}</p>`
    );

    return { ok: true };
  } catch (error) {
    console.error("Failed to send wrong-email registration alert:", error);
    return { ok: false, error: error?.message || "Unknown error" };
  }
};

export const sendRegistrationSuccessAlert = async ({
  firstName,
  emailId,
  ip,
  userAgent,
}) => {
  try {
    const to = getAdminAlertEmail();
    const safeName = String(firstName || "User").trim();
    const safeEmail = String(emailId || "(unknown)").trim();

    await sendEmail(
      to,
      "Registration Status Alert",
      `This user has been registered: ${safeName} (${safeEmail})`,
      `<p><strong>Registration Status:</strong> This user has been registered.</p>
       <p><strong>Name:</strong> ${safeName}</p>
       <p><strong>Email:</strong> ${safeEmail}</p>
       <p><strong>IP:</strong> ${ip || "unknown"}</p>
       <p><strong>User Agent:</strong> ${userAgent || "unknown"}</p>
       <p>No OTP is included in admin notifications.</p>`
    );

    return { ok: true };
  } catch (error) {
    console.error("Failed to send registration success alert:", error);
    return { ok: false, error: error?.message || "Unknown error" };
  }
};
