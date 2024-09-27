import sgMail from "@sendgrid/mail";
import { URL } from "url";
import { v4 as uuidv4 } from "uuid";
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);