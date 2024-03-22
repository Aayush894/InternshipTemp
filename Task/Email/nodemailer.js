import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const sendEmail = async (text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
      ciphers: "SSLv3",
    },
  });

  console.log("Credentials obtained, sending message...");


  var mailOptions = {
    from: process.env.SMTP_MAIL,
    to: process.env.INTENDED_MAIL,
    subject: `Scheduled Data Update`,
    html: `<h2>Data Updata: [${text}]</h2>`,
  };

  console.log(mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: " + info.response);

  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export { sendEmail };
