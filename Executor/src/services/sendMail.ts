// src/mailer.ts

import nodemailer from "nodemailer";
import { CredManager } from "../utils/CredManager";

async function getOrCreateTransporter(userID: number) {
  try {
    if (CredManager.getInstance().transporterCacheGet(userID)) {
      console.log(`Reusing existing transporter for user: ${userID}`);
      return CredManager.getInstance().transporterCacheGet(userID)!;
    }
   

    const creds = CredManager.getInstance().getCred("smtp");

    const EMAIL_USER = creds?.EMAIL_USER;
    const EMAIL_PASS = creds?.EMAIL_PASS;
    //calling the FetchCreds function

    // A transporter is an object that can send mail.
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use 'gmail' for simplicity
      auth: {
        user: EMAIL_USER!,
        pass: EMAIL_PASS,
      },
    });
    CredManager.getInstance().transporterCacheSet(userID,transporter)
    return transporter;
  } catch (error) {
    throw new Error("error creating transporter");
  }

  // 2. Define the email options
  // This object specifies the sender, recipient, subject, and content.
}
// 3. Create an async function to send the email
export async function sendEmail(
  to: string,
  from: string,
  body: string,
  userID: number
) {
  try {

    const transporter = await getOrCreateTransporter(userID);
    const mailOptions = {
      // Sender address
      from: `${from}`,
      to: `${to}`,
      subject: "Hello from Nodemailer! 👋", // Subject line
      html: `${body}`, // HTML body
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// 4. Call the function
