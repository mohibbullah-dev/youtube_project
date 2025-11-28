import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { apiError } from "./apiError.js";

async function sendEmail(option) {
  if (!option.email || !option.subject || !option.mailformat) {
    throw new apiError(400, "Invalid email options");
  }
  console.log("option :", option);
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVICE,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  const { emailBody, emailText } = mailConfig(option.mailformat);

  try {
    await transporter.sendMail({
      from: "youtueb <contact34@gmail.com>",
      to: option.email,
      subject: option.subject,
      text: emailText,
      html: emailBody,
    });
  } catch (error) {
    throw new apiError(500, error.message);
  }
}

function mailConfig(mailformat) {
  let mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "yoututbe",
      link: "https://youtueb.come/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  let emailBody = mailGenerator.generate(mailformat);
  let emailText = mailGenerator.generatePlaintext(mailformat);
  return { emailBody, emailText };
}

const verifyMailFormat = (name, verifyToken) => {
  return {
    body: {
      name: name,
      intro: "Welcome to this email! We're very excited to have you on verify.",
      action: {
        instructions: "To verify your account, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify account",
          link: verifyToken,
        },
      },
      // outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    },
  };
};
const verifyOtpFormat = (name, otp) => {
  return {
    body: {
      name: name,
      intro: "Welcome to this email! We're very excited to have you on verify.",
      action: {
        instructions: "To verify your account, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: otp,
          link: null,
        },
      },
    },
  };
};

export { sendEmail, verifyMailFormat, verifyOtpFormat };
