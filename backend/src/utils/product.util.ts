import Qrcode from "qrcode";
import { logger } from "../utils/logger";

export const generateProductQrCode = async (
  productId: string,
): Promise<string> => {
  try {
    const qrCodeDataUrl = await Qrcode.toDataURL(productId);
    return qrCodeDataUrl;
  } catch (error) {
    logger.error({ err: error }, "Error generating QR code:");
    throw error;
  }
};
