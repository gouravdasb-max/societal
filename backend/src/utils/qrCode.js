import QRCode from "qrcode";

export const generateQRCode = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error("Failed to generate QR code: " + error.message);
  }
};

export const uploadQRToCloudinary = async (qrDataUrl, uploadOnCloudinary) => {
  try {
    const buffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const tempPath = `./public/temp/qr_${Date.now()}.png`;
    const fs = await import("fs/promises");
    await fs.writeFile(tempPath, buffer);
    const result = await uploadOnCloudinary(tempPath);
    try {
      await fs.unlink(tempPath);
    } catch (e) {
      console.error("Could not delete temp file:", e.message);
    }
    
    return result?.url || null;
  } catch (error) {
    console.error("QR upload error:", error.message);
    return null;
  }
};
