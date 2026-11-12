"use server";

import prisma from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { dispatchAppointmentNotification, type DispatchReceipt } from "@/lib/services/notifications";

export interface CreateAppointmentInput {
  propertyId: string;
  propertyTitle?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string; // ISO date or "YYYY-MM-DD"
  timeSlot?: string; // "14:00"
  tourType?: "PHYSICAL" | "ONLINE_VIDEO";
  vipTransfer?: "HELICOPTER" | "CHAUFFEUR" | "YACHT" | "NONE";
  agencyNotes?: string;
}

export interface AppointmentRecord {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: string;
  agentId?: string | null;
  agentName?: string;
  tourType: "PHYSICAL" | "ONLINE_VIDEO";
  vipTransfer?: string;
  notes?: string;
}

// In-Memory Fallback Appointments Pool
let SEED_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "app-101",
    guestName: "Lord Julian Sterling",
    guestEmail: "sterling@familyoffice.co.uk",
    guestPhone: "+44 7911 123456",
    date: "2026-11-12",
    timeSlot: "14:00",
    status: AppointmentStatus.PENDING,
    propertyId: "prop-1",
    propertyTitle: "The Bosphorus Waterfront Palace",
    propertyPrice: "€ 42.500.000",
    agentId: "user-owner-01",
    agentName: "Derin Soydan",
    tourType: "PHYSICAL",
    vipTransfer: "HELICOPTER",
    notes: "Atatürk Havalimanı Genel Havacılık terminalinden helikopter ile transfer talep ediyor.",
  },
  {
    id: "app-102",
    guestName: "Marc & Sophie Dupont",
    guestEmail: "m.dupont@monaco-wealth.mc",
    guestPhone: "+377 98 98 00 00",
    date: "2026-11-14",
    timeSlot: "11:30",
    status: AppointmentStatus.PENDING,
    propertyId: "prop-2",
    propertyTitle: "Villa Belle Époque - Cap d'Antibes",
    propertyPrice: "€ 38.000.000",
    agentId: "user-agent-03",
    agentName: "Kerem Arslan",
    tourType: "ONLINE_VIDEO",
    notes: "Google Meet üzerinden 4K 360 sanal tur eşliğinde mimari detayları incelemek istiyorlar.",
  },
  {
    id: "app-103",
    guestName: "Sheikh Mansoor Al-Nahyan",
    guestEmail: "mansoor@holding.ae",
    guestPhone: "+971 50 123 4567",
    date: "2026-11-15",
    timeSlot: "16:00",
    status: AppointmentStatus.CONFIRMED,
    propertyId: "prop-3",
    propertyTitle: "Sky Penthouse at Palm Jumeirah",
    propertyPrice: "$ 27.900.000",
    agentId: "user-owner-01",
    agentName: "Derin Soydan",
    tourType: "PHYSICAL",
    vipTransfer: "CHAUFFEUR",
    notes: "Özel şoförlü Maybach transferi organize edildi. NDA imzalandı.",
  },
  {
    id: "app-104",
    guestName: "Dr. Alistair Finch",
    guestEmail: "afinch@geneva-med.ch",
    guestPhone: "+41 22 710 00 00",
    date: "2026-11-18",
    timeSlot: "10:00",
    status: AppointmentStatus.CONFIRMED,
    propertyId: "prop-4",
    propertyTitle: "Yalıkavak Cliffside Private Estate",
    propertyPrice: "€ 18.500.000",
    agentId: "user-agent-01",
    agentName: "Can Demir",
    tourType: "PHYSICAL",
    vipTransfer: "YACHT",
    notes: "Yalıkavak Marina'dan tekneyle iskeleye yanaşacak.",
  },
  {
    id: "app-105",
    guestName: "Elena Rostova",
    guestEmail: "elena.r@zurich-invest.com",
    guestPhone: "+41 44 200 00 00",
    date: "2026-11-08",
    timeSlot: "15:00",
    status: AppointmentStatus.COMPLETED,
    propertyId: "prop-5",
    propertyTitle: "Bebek Waterfront Historical Mansion",
    propertyPrice: "€ 52.000.000",
    agentId: "user-agent-01",
    agentName: "Can Demir",
    tourType: "PHYSICAL",
    notes: "Gösterim tamamlandı, 2. tur teklif aşamasında.",
  },
];

/**
 * 1. Müşteri Tarafından Yeni Randevu Talebi Oluşturma (PENDING)
 */
export async function createAppointment(data: CreateAppointmentInput) {
  try {
    if (!data.propertyId || !data.guestName || !data.guestEmail || !data.date) {
      throw new Error("Lütfen isim, e-posta ve randevu tarihini eksiksiz doldurunuz.");
    }

    const timeSlot = data.timeSlot || "14:00";
    const dateFormatted = data.date.includes("T") ? data.date : `${data.date}T${timeSlot}:00Z`;

    // Prisma veritabanına kaydetmeyi dene
    try {
      const created = await prisma.appointment.create({
        data: {
          propertyId: data.propertyId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          date: new Date(dateFormatted),
          status: AppointmentStatus.PENDING,
        },
      });

      return {
        success: true,
        appointmentId: created.id,
        message: "Ev turu randevu talebiniz başarıyla alındı. Temsilcimiz onay için sizinle iletişime geçecektir.",
      };
    } catch {
      // Prisma offline/seed fallback
      const newRecord: AppointmentRecord = {
        id: `app-${Date.now()}`,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        date: data.date.split("T")[0],
        timeSlot,
        status: AppointmentStatus.PENDING,
        propertyId: data.propertyId,
        propertyTitle: data.propertyTitle || "Seçilen Lüks Mülk",
        tourType: data.tourType || "PHYSICAL",
        vipTransfer: data.vipTransfer || "CHAUFFEUR",
        notes: data.agencyNotes || "Vitrin randevu widget'ı üzerinden alındı.",
      };

      SEED_APPOINTMENTS = [newRecord, ...SEED_APPOINTMENTS];

      return {
        success: true,
        appointmentId: newRecord.id,
        appointment: newRecord,
        message: "Ev turu randevu talebiniz başarıyla alındı. Temsilcimiz onay için sizinle iletişime geçecektir.",
      };
    }
  } catch (error: unknown) {
    console.error("Appointment creation error:", error);
    const message =
      error instanceof Error ? error.message : "Randevu oluşturulurken bir hata oluştu.";
    return { success: false, error: message };
  }
}

/**
 * 2. Emlakçı Tarafından Randevuyu Onaylama (CONFIRMED) veya Reddetme (CANCELLED)
 * Onay durumunda SMS & E-posta bildirim servisi tetiklenir.
 */
export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  try {
    let target = SEED_APPOINTMENTS.find((a) => a.id === id);

    // Prisma güncellemesi
    try {
      const updated = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: { property: true, agent: true },
      });

      if (updated) {
        target = {
          id: updated.id,
          guestName: updated.guestName,
          guestEmail: updated.guestEmail,
          guestPhone: updated.guestPhone,
          date: updated.date.toISOString().split("T")[0],
          timeSlot: updated.date.toISOString().split("T")[1]?.slice(0, 5) || "14:00",
          status: updated.status,
          propertyId: updated.propertyId,
          propertyTitle: updated.property.title,
          agentName: updated.agent?.fullName,
          tourType: "PHYSICAL",
        };
      }
    } catch {
      // In-memory update
      SEED_APPOINTMENTS = SEED_APPOINTMENTS.map((a) => (a.id === id ? { ...a, status } : a));
      target = SEED_APPOINTMENTS.find((a) => a.id === id);
    }

    if (!target) {
      throw new Error("Randevu kaydı bulunamadı.");
    }

    // 3. SMS ve E-posta Bildirim Servisini Tetikle
    let dispatchReceipt: DispatchReceipt | null = null;

    if (status === AppointmentStatus.CONFIRMED || status === AppointmentStatus.CANCELLED) {
      dispatchReceipt = await dispatchAppointmentNotification({
        status: status as "CONFIRMED" | "CANCELLED",
        guestName: target.guestName,
        guestEmail: target.guestEmail,
        guestPhone: target.guestPhone,
        agentName: target.agentName || "Derin Soydan",
        propertyTitle: target.propertyTitle,
        dateStr: `${target.date} saat ${target.timeSlot}`,
        tourType: target.tourType,
      });
    }

    return {
      success: true,
      updatedId: id,
      newStatus: status,
      receipt: dispatchReceipt,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Randevu durumu güncellenemedi.";
    return { success: false, error: msg };
  }
}

/**
 * 3. Tüm Randevuları Listeleme (Emlakçı Takvim Ekranı İçin)
 */
export async function getAllAppointments(): Promise<AppointmentRecord[]> {
  try {
    const dbAppointments = await prisma.appointment.findMany({
      include: { property: true, agent: true },
      orderBy: { date: "asc" },
    });

    if (dbAppointments && dbAppointments.length > 0) {
      return dbAppointments.map((a) => ({
        id: a.id,
        guestName: a.guestName,
        guestEmail: a.guestEmail,
        guestPhone: a.guestPhone,
        date: a.date.toISOString().split("T")[0],
        timeSlot: a.date.toISOString().split("T")[1]?.slice(0, 5) || "14:00",
        status: a.status,
        propertyId: a.propertyId,
        propertyTitle: a.property.title,
        propertyPrice: `${a.property.currency} ${Number(a.property.price).toLocaleString("tr-TR")}`,
        agentId: a.agentId,
        agentName: a.agent?.fullName || "Derin Soydan",
        tourType: "PHYSICAL",
      }));
    }
  } catch (err) {
    console.warn("DB appointments lookup offline, using seed:", err);
  }

  return SEED_APPOINTMENTS;
}
