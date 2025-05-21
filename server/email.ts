import nodemailer from "nodemailer";

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info.yourmobileplanet@gmail.com";

interface WithdrawalEmailData {
  fullName: string;
  address: string;
  mobileNumber: string;
  easyPaisaNumber: string;
  amount: number;
}

// Since this is for development, we'll use a fake SMTP service
// and log the email content to the console instead
export async function sendWithdrawalEmail(data: WithdrawalEmailData): Promise<void> {
  try {
    const emailContent = `
      Withdrawal Request Details:
      -------------------------
      Full Name: ${data.fullName}
      Address: ${data.address}
      Mobile Number: ${data.mobileNumber}
      EasyPaisa Account: ${data.easyPaisaNumber}
      Amount (after fee): PKR ${data.amount}
      -------------------------
      
      Please process this withdrawal within 24-48 hours.
    `;
    
    console.log("\n======= WITHDRAWAL EMAIL =======");
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: Withdrawal Request from ${data.fullName}`);
    console.log(emailContent);
    console.log("================================\n");
    
    // In a production environment, you would use a real SMTP service:
    /*
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: `Withdrawal Request from ${data.fullName}`,
      text: emailContent,
    });
    */
    
    return Promise.resolve();
  } catch (error) {
    console.error("Failed to send withdrawal email:", error);
    return Promise.reject(error);
  }
}
