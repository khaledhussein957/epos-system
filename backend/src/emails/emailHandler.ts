import { getTransporter } from "../config/nodemailer";

import { ENV } from "../config/env";

export const sendResetPasswordEmail = async (
  email: string,
  code: string,
  expiresIn: number,
) => {
  const transporter = await getTransporter();

  try {
    const info = await transporter.sendMail({
      from: ENV.SMTP_EMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `Please use the following code to reset your password: ${code}`,
    });

    if (info.rejected.length > 0) {
      throw new Error(
        `Email rejected by server: ${info.rejected.length} recipient(s) failed`,
      );
    }

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email: " + error);
  }
};

export const sendSuccessResetPasswordEmail = async (email: string) => {
  const transporter = await getTransporter();

  try {
    const info = await transporter.sendMail({
      from: ENV.SMTP_EMAIL,
      to: email,
      subject: "Password Reset Success",
      text: "Your password has been successfully reset. You can now log in with your new password.",
    });

    if (info.rejected.length > 0) {
      throw new Error(
        `Email rejected by server: ${info.rejected.length} recipient(s) failed`,
      );
    }

    return true;
  } catch (error) {
    console.error("Error sending success email:", error);
    throw new Error("Error sending success email: " + error);
  }
};
