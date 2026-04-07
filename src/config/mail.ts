// @ts-ignore
import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv"
import { sendInviteEmail } from "../templates/emailTemplates.js";
dotenv.config() 
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmailInvites = async (to:string, inviteLink: string) => {

  try {
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.EMAIL_FROM };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = "Call for Registeration";
    sendSmtpEmail.htmlContent=sendInviteEmail(to, inviteLink);
     const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Waitlist welcome email sent successfully:", response);
    return { success: true, data: response };
  } catch (error) {
      console.error("Error sending waitlist welcome email:", error);
    throw new Error("Waitlist welcome email could not be sent.");
  }

}