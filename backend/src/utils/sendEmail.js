import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// 1. Existing Team Welcome Email
export const sendWelcomeEmail = async (options) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"Freelance OS" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: "Welcome to the Agency! 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #D2C9D8; border-radius: 10px;">
        <h2 style="color: #35313F;">Welcome to the Team, ${options.name}!</h2>
        <p style="color: #5B5569; font-size: 16px;">You have been invited to join the agency workspace.</p>
        <div style="background-color: #F2EAE3; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #35313F;"><strong>Your Login Credentials:</strong></p>
          <p style="margin: 5px 0 0 0; color: #5B5569;"><strong>Email:</strong> ${options.email}</p>
          <p style="margin: 5px 0 0 0; color: #5B5569;"><strong>Temporary Password:</strong> ${options.password}</p>
        </div>
        <p style="color: #5B5569; font-size: 14px;">Please log in and change your password as soon as possible.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// 2. NEW: Send Invoice with PDF Attachment
export const sendInvoiceEmail = async (options) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: `"Freelance OS" <${process.env.EMAIL_USER}>`,
    to: options.clientEmail,
    subject: `New Invoice from Freelance OS: ${options.invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #D2C9D8; border-radius: 10px;">
        <h2 style="color: #35313F;">Hello ${options.clientName},</h2>
        <p style="color: #5B5569; font-size: 16px;">I hope this email finds you well.</p>
        <p style="color: #5B5569; font-size: 16px;">Please find attached the invoice <strong>${options.invoiceNumber}</strong> for the project <strong>${options.projectTitle}</strong>.</p>
        
        <div style="background-color: #F2EAE3; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #35313F; font-size: 18px;"><strong>Amount Due: $${options.amount.toLocaleString()}</strong></p>
          <p style="margin: 5px 0 0 0; color: #rose-500;"><strong>Due Date:</strong> ${new Date(options.dueDate).toLocaleDateString()}</p>
        </div>

        <p style="color: #5B5569; font-size: 14px;">Thank you for your business!</p>
      </div>
    `,
    attachments: [
      {
        filename: `${options.invoiceNumber}.pdf`,
        content: options.pdfBuffer, // 🚀 This is the magic part! We attach the raw memory buffer directly.
        contentType: 'application/pdf'
      }
    ]
  };
  await transporter.sendMail(mailOptions);
};