// src/mailer.ts
import nodemailer from "nodemailer";
import prisma from "@shashankpandey/prisma";
import { CredManager } from "../utils/CredManager";

async function getOrCreateTransporter(userID: number): Promise<nodemailer.Transporter> {
    try {
        const cachedTransporter = CredManager.getInstance().transporterCacheGet(userID);
        if (cachedTransporter) {
            console.log(`Reusing existing transporter for user: ${userID}`);
            return cachedTransporter;
        }

        const creds = CredManager.getInstance().getCred("smtp");
        if (!creds?.EMAIL_USER || !creds?.EMAIL_PASS) {
            throw new Error(`SMTP credentials not found for user ${userID}`);
        }

        const transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            service: "gmail",
            auth: {
                user: creds.EMAIL_USER,
                pass: creds.EMAIL_PASS,
            },
            socketTimeout: 60000,
        });
        
        CredManager.getInstance().transporterCacheSet(userID, transporter);
        return transporter;
    } catch (error) {
        console.error("Error creating transporter:", error);
        throw new Error("Failed to create or get transporter.");
    }
}

export async function sendEmail(
    to: string,
    from: string,
    body: string,
    userID: number,
    action: string,
    workflowId: number,
    executionId: number,
    nodeId: string,
    subject:string,
   
) {
    try {
        const transporter = await getOrCreateTransporter(userID);
        console.log('hello')
        const mailOptions = {
            from: `"${from}" <${CredManager.getInstance().getCred("smtp")?.EMAIL_USER}>`,
            to: to,
            
            subject: `${subject} 👋`,
            html: body,
        };

        const info = await transporter.sendMail(mailOptions);
        
        
        const sentMessageId = info.messageId;
        console.log(`Email sent successfully with Message-ID: ${sentMessageId}`);
        
        if (action === "Send&wait") {
            try {
              
                await prisma.emailWait.create({
                    data: {
                        messageId: sentMessageId, 
                        workflowId: workflowId,
                        executionId: executionId,
                        nodeId: nodeId,
                        userId: userID,
                        status: "WAITING",
                    },
                });
                console.log(`Created EmailWait entry, now waiting for a reply to: ${sentMessageId}`);
                return {success:false,status:"PENDING",data:mailOptions}; // Correctly pauses the workflow
            } catch (error) {
                console.warn("Could not create EmailWait entry in the DB:", error);
                return { success:true,status:"FAILED",data:mailOptions} // Resume workflow if DB write fails
            }
        }
        return {success:true,status:"SUCCESS",data:mailOptions};
    } catch (error) {
        console.error("Error sending email:", error);
        CredManager.getInstance().clearTransportCache(userID)
        return {success:false,status:"FAILED",data:error};
    }
}