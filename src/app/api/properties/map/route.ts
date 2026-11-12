import { NextResponse } from "next/server";
import { getLiveGeoMapProperties } from "@/lib/public-properties";

export const dynamic = "force-dynamic";

export async function GET() {
  const { properties, dbConnected } = await getLiveGeoMapProperties();

  return NextResponse.json({
    properties,
    count: properties.length,
    dbConnected,
  });
}

