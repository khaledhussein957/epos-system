import Qrcode from "qrcode";

export const generateProductQrCode = async (
  productId: string,
): Promise<string> => {
  try {
    const qrCodeDataUrl = await Qrcode.toDataURL(productId);
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};
