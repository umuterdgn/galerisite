import { NextRequest, NextResponse } from "next/server";
import { createAppointment, getAllAppointments } from "@/lib/actions/appointment";

export async function GET() {
  try {
    const list = await getAllAppointments();
    return NextResponse.json({ success: true, appointments: list });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Randevular getirilemedi.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createAppointment({
      propertyId: body.propertyId,
      propertyTitle: body.propertyTitle,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      date: body.date,
      timeSlot: body.timeSlot,
      tourType: body.tourType,
      vipTransfer: body.vipTransfer,
      agencyNotes: body.agencyNotes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Randevu talebi işlenemedi.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

