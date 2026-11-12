import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaType = (formData.get("mediaType") as string) || "IMAGE";
    const roomLabel = (formData.get("roomLabel") as string) || "";
    const isStaged = formData.get("isStaged") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const hasCloudinaryConfig =
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      Boolean(process.env.CLOUDINARY_API_SECRET) &&
      Boolean(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
          process.env.CLOUDINARY_CLOUD_NAME
      ) &&
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "demo";

    if (hasCloudinaryConfig) {
      // Cloudinary upload resource type mapping
      const resourceType = mediaType === "VIDEO" ? "video" : "image";

      const uploadResult = await new Promise<{
        secure_url: string;
        public_id: string;
        format: string;
        width?: number;
        height?: number;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder:
              mediaType === "PANORAMA_360"
                ? "galerisite/panoramas"
                : "galerisite/properties",
            resource_type: resourceType,
            transformation:
              resourceType === "image"
                ? [{ quality: "auto:best" }, { fetch_format: "auto" }]
                : undefined,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary yüklemesi başarısız oldu."));
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
              });
            }
          }
        );

        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        storage: "cloudinary",
        media: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          type: mediaType,
          roomLabel,
          isStaged,
          width: uploadResult.width,
          height: uploadResult.height,
        },
      });
    }

    // Yerel geliştirme ortamı fallback'i (Cloudinary API anahtarları henüz girilmediyse)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "tours");
    await mkdir(uploadDir, { recursive: true });

    const safeExt =
      path.extname(file.name || ".jpg").replace(/[^a-zA-Z0-9.]/g, "") || ".jpg";
    const fileName = `tour-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${safeExt}`;
    const targetPath = path.join(uploadDir, fileName);

    await writeFile(targetPath, buffer);

    return NextResponse.json({
      success: true,
      storage: "local-dev",
      media: {
        url: `/uploads/tours/${fileName}`,
        publicId: fileName,
        type: mediaType,
        roomLabel,
        isStaged,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Dosya yüklenirken bir hata oluştu.";
    console.error("Media upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
