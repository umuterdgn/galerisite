import { NextRequest, NextResponse } from "next/server";
import {
  generateSeoMetadata,
  saveSeoToDatabase,
  type PropertySeoInput,
} from "@/lib/seo-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const title = String(body.title || "").trim();
    const city = String(body.city || "").trim();

    if (!title || !city) {
      return NextResponse.json(
        { error: "Başlık ('title') ve Şehir ('city') alanları zorunludur." },
        { status: 400 }
      );
    }

    const inputData: PropertySeoInput = {
      propertyId: body.propertyId ? String(body.propertyId) : undefined,
      title,
      city,
      district: body.district ? String(body.district) : undefined,
      country: body.country ? String(body.country) : "TR",
      price: Number(body.price) || 10000000,
      currency: body.currency ? String(body.currency) : "EUR",
      bedrooms: body.bedrooms ? Number(body.bedrooms) : 4,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : 4,
      squareMeters: body.squareMeters ? Number(body.squareMeters) : 500,
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      description: body.description ? String(body.description) : undefined,
      agencyName: body.agencyName ? String(body.agencyName) : "Lumière Prime Estates",
      agencyPhone: body.agencyPhone ? String(body.agencyPhone) : "+90 (212) 800 40 50",
      agentName: body.agentName ? String(body.agentName) : undefined,
      images: Array.isArray(body.images) ? body.images : undefined,
      latitude: body.latitude ? Number(body.latitude) : undefined,
      longitude: body.longitude ? Number(body.longitude) : undefined,
    };

    // 1. Gemini / Algoritmik Motor ile SEO & GEO verilerini üret
    const generated = await generateSeoMetadata(inputData);

    let savedToDb = false;
    let saveError: string | undefined = undefined;

    // 2. Prisma veritabanına otomatik kaydet (Eğer propertyId varsa ve saveToDb true ise)
    const shouldSave = body.saveToDb !== false && Boolean(inputData.propertyId);

    if (shouldSave && inputData.propertyId) {
      const saveRes = await saveSeoToDatabase(inputData.propertyId, {
        seoTitle: generated.seoTitle,
        seoDesc: generated.seoDesc,
        schemaJson: generated.schemaJson,
      });

      savedToDb = saveRes.success;
      if (!saveRes.success) {
        saveError = saveRes.error;
      }
    }

    return NextResponse.json({
      success: true,
      seoTitle: generated.seoTitle,
      seoDesc: generated.seoDesc,
      schemaJson: generated.schemaJson,
      geoSummary: generated.geoSummary,
      engine: generated.engine,
      savedToDb,
      saveError,
    });
  } catch (error: unknown) {
    console.error("SEO/GEO Generator API Error:", error);
    const message =
      error instanceof Error ? error.message : "Beklenmedik bir hata oluştu.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

