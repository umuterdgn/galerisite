import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath, revalidateTag } from "next/cache";
import { MediaType } from "@prisma/client";
import { cloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

const VALID_MEDIA_TYPES = new Set<string>(Object.values(MediaType));

async function persistUploadedMediaIfRequested(params: {
  persist: boolean;
  propertyId: string;
  url: string;
  mediaType: string;
  roomLabel: string;
  isStaged: boolean;
  sortOrder: number;
}) {
  if (!params.persist || !params.propertyId) return null;

  const resolvedType = VALID_MEDIA_TYPES.has(params.mediaType)
    ? (params.mediaType as MediaType)
    : MediaType.IMAGE;

  const created = await prisma.media.create({
    data: {
      property: { connect: { id: params.propertyId } },
      url: params.url,
      type: resolvedType,
      roomLabel: params.roomLabel || (resolvedType === MediaType.PANORAMA_360 ? "Sanal Oda" : null),
      isStaged: params.isStaged,
      sortOrder: params.sortOrder,
    },
  });

  revalidateTag("properties");
  revalidatePath("/", "layout");
  revalidatePath(`/properties/${params.propertyId}`);
  revalidatePath(`/tr/properties/${params.propertyId}`);
  revalidatePath(`/en/properties/${params.propertyId}`);

  return created;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaType = ((formData.get("mediaType") as string) || "IMAGE").trim();
    const roomLabel = ((formData.get("roomLabel") as string) || "").trim();
    const isStaged = formData.get("isStaged") === "true";
    const propertyId = ((formData.get("propertyId") as string) || "").trim();
    const persist = formData.get("persist") === "true";
    const sortOrderRaw = Number(formData.get("sortOrder") ?? 0);
    const sortOrder = Number.isFinite(sortOrderRaw) ? sortOrderRaw : 0;

    if (!file) {
      return NextResponse.json(
        { error: "Dosya bulunamadı." },
        { status: 400 }
      );
    }

    if (mediaType === MediaType.PANORAMA_360 || persist) {
      if (!propertyId) {
        return NextResponse.json(
          { error: "360° medya yüklemek için ilan seçimi (propertyId) zorunludur." },
          { status: 400 }
        );
      }

      const targetProperty = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true },
      });

      if (!targetProperty) {
        return NextResponse.json(
          { error: "Seçili ilan veritabanında bulunamadı." },
          { status: 404 }
        );
      }
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

      const persisted = await persistUploadedMediaIfRequested({
        persist,
        propertyId,
        url: uploadResult.secure_url,
        mediaType,
        roomLabel,
        isStaged,
        sortOrder,
      });

      return NextResponse.json({
        success: true,
        storage: "cloudinary",
        media: {
          id: persisted?.id,
          propertyId: propertyId || undefined,
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
    const localUrl = `/uploads/tours/${fileName}`;

    const persisted = await persistUploadedMediaIfRequested({
      persist,
      propertyId,
      url: localUrl,
      mediaType,
      roomLabel,
      isStaged,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      storage: "local-dev",
      media: {
        id: persisted?.id,
        propertyId: propertyId || undefined,
        url: localUrl,
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
