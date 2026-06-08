// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";
import { getEmailVerificationHTML, sendInviteEmail, getAnnouncementEmailHTML, getPasswordResetHTML, } from "../templates/emailTemplates.js";
dotenv.config();
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendTransactionalEmail = async (to, subject, htmlContent) => {
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.EMAIL_FROM };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, data: response };
};
export const sendVerificationEmail = async (to, name, verificationLink) => {
    try {
        return await sendTransactionalEmail(to, "Verify your Ayonaire account", getEmailVerificationHTML(name, verificationLink));
    }
    catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Verification email could not be sent.");
    }
};
export const sendPasswordResetEmail = async (to, name, resetLink) => {
    try {
        return await sendTransactionalEmail(to, "Reset your Ayonaire password", getPasswordResetHTML(name, resetLink));
    }
    catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Password reset email could not be sent.");
    }
};
export const sendEmailInvites = async (to, inviteLink) => {
    try {
        let defaultClient = SibApiV3Sdk.ApiClient.instance;
        let apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { email: process.env.EMAIL_FROM };
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = "Call for Registeration";
        sendSmtpEmail.htmlContent = sendInviteEmail(to, inviteLink);
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Waitlist welcome email sent successfully:", response);
        return { success: true, data: response };
    }
    catch (error) {
        console.error("Error sending waitlist welcome email:", error);
        throw new Error("Waitlist welcome email could not be sent.");
    }
};
export const sendAnnouncementToStudentsInACohort = async (studentEmails, title, summary) => {
    try {
        let defaultClient = SibApiV3Sdk.ApiClient.instance;
        let apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const emailHtml = getAnnouncementEmailHTML(title, summary);
        const recipients = studentEmails.map((email) => ({ email }));
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { email: process.env.EMAIL_FROM };
        sendSmtpEmail.to = recipients;
        sendSmtpEmail.subject = title;
        sendSmtpEmail.htmlContent = emailHtml;
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Announcement sent successfully:", response);
        return { success: true, data: response };
    }
    catch (error) {
        console.error("Error sending announcement:", error);
        throw new Error("Announcement could not be sent.");
    }
};
export const sendAnnouncementToStudentsInACourse = async (studentEmails, title, summary) => {
    try {
        let defaultClient = SibApiV3Sdk.ApiClient.instance;
        let apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const emailHtml = getAnnouncementEmailHTML(title, summary);
        const recipients = studentEmails.map((email) => ({ email }));
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { email: process.env.EMAIL_FROM };
        sendSmtpEmail.to = recipients;
        sendSmtpEmail.subject = title;
        sendSmtpEmail.htmlContent = emailHtml;
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Announcement sent successfully:", response);
        return { success: true, data: response };
    }
    catch (error) {
        console.error("Error sending announcement:", error);
        throw new Error("Announcement could not be sent.");
    }
};
