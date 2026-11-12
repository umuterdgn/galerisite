import { v2 as cloudinary } from "cloudinary";

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export { cloudinary };

/**
 * Cloudinary optimize edilmiş görsel URL üretici
 * WebP/AVIF otomatik dönüşümü ve PageSpeed optimizasyonu sağlar.
 */
export function getOptimizedMediaUrl(
  publicIdOrUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | number;
    format?: "auto" | "webp" | "avif";
  }
) {
  if (!publicIdOrUrl) return "";

  // Eğer zaten tam bir Cloudinary URL'si ise
  if (publicIdOrUrl.startsWith("http")) {
    return publicIdOrUrl;
  }

  return cloudinary.url(publicIdOrUrl, {
    fetch_format: options?.format || "auto",
    quality: options?.quality || "auto:best",
    width: options?.width,
    height: options?.height,
    crop: "limit",
    secure: true,
  });
}

