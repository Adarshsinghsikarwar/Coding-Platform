import nodemailer from "nodemailer";
import { google } from "googleapis";
import { config } from "../config/config.js";

// Use the Google OAuth2 client to get a fresh access token each time.
// This uses the credentials already in your .env:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Redirect URI used when you got the refresh token
);

oauth2Client.setCredentials({
  refresh_token: config.GOOGLE_REFRESH_TOKEN,
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    // Get a fresh access token using our refresh token
    const { token: accessToken } = await oauth2Client.getAccessToken();

    // Create the transporter with the fresh access token
    const transporter = nodemailer.createTransport({
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

    const info = await transporter.sendMail({
      from: `"Coding Platform" <${config.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent to:", to, "| Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email to:", to);
    console.error("Reason:", error.message);
  }
};
