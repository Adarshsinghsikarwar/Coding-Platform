import nodemailer from "nodemailer";
import { google } from "googleapis";
import { config } from "../config/config.js";

// Use the Google OAuth2 client to get a fresh access token each time.
// This uses the credentials already in your .env:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground", // Redirect URI used when you got the refresh token
);

oauth2Client.setCredentials({
  refresh_token: config.GOOGLE_REFRESH_TOKEN,
});

let etherealTransporter = null;

const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;
  console.log("Creating a temporary test email account (Ethereal)...");
  const testAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return etherealTransporter;
};

export const sendEmail = async (to, subject, text, html) => {
  try {
    let transporter;
    let useEthereal = false;

    // Check if GMAIL_APP_PASSWORD is provided and is not the placeholder value
    if (
      config.GMAIL_APP_PASSWORD &&
      config.GMAIL_APP_PASSWORD !== "abcdefghijklmnop"
    ) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.GOOGLE_USER,
          pass: config.GMAIL_APP_PASSWORD,
        },
      });
    } else {
      try {
        // Get a fresh access token using our refresh token
        const { token: accessToken } = await oauth2Client.getAccessToken();

        // Create the transporter with the fresh access token
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: config.GOOGLE_USER,
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            refreshToken: config.GOOGLE_REFRESH_TOKEN,
            accessToken,
          },
        });
      } catch (oauthErr) {
        console.warn(
          "⚠️ Gmail OAuth2 failed. Falling back to Ethereal Test Email.",
        );
        transporter = await getEtherealTransporter();
        useEthereal = true;
      }
    }

    const fromAddress = useEthereal
      ? `"Coding Platform Test" <test@ethereal.email>`
      : `"Coding Platform" <${config.GOOGLE_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    if (useEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("\n=========================================");
      console.log(`✉️  [Ethereal Test Mail] Sent to: ${to}`);
      console.log(`🔗  VIEW OTP EMAIL HERE: ${previewUrl}`);
      console.log("=========================================\n");
    } else {
      console.log("Email sent to:", to, "| Message ID:", info.messageId);
    }
  } catch (error) {
    console.error("Failed to send email to:", to);
    console.error("Reason:", error.message);
    if (error.message && error.message.includes("invalid_grant")) {
      console.error(
        "💡 SUGGESTION: Your GOOGLE_REFRESH_TOKEN in .env has expired or is invalid. " +
          "To fix this, either refresh your OAuth credentials or generate a Google App Password " +
          "and set GMAIL_APP_PASSWORD in your .env file.",
      );
    }
  }
};
