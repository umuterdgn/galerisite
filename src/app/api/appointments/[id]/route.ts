import { NextRequest, NextResponse } from "next/server";
import { updateAppointmentStatus } from "@/lib/actions/appointment";
import { AppointmentStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const status = body.status as AppointmentStatus;

    if (!status || !Object.values(AppointmentStatus).includes(status)) {
      return NextResponse.json(
        { error: "Geçersiz randevu durumu. 'CONFIRMED' veya 'CANCELLED' olmalıdır." },
        { status: 400 }
      );
    }

    const result = await updateAppointmentStatus(id, status);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Randevu güncellenemedi.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

