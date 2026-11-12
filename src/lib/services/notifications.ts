/**
 * VIP Randevu & Rezervasyon Bildirim Servisi (SMS & E-Posta Simülasyonu)
 * Gerçekte Twilio SMS, SendGrid / Resend veya Kurumsal SMTP ile entegre çalışır.
 */

export interface NotificationPayload {
  recipientType: "GUEST" | "AGENT";
  recipientName: string;
  recipientContact: string; // Telefon veya E-posta
  channel: "SMS" | "EMAIL";
  subject: string;
  body: string;
  propertyTitle: string;
  appointmentDate: string;
  timeSlot?: string;
  tourType: "PHYSICAL" | "ONLINE_VIDEO";
  calendarInviteUrl?: string;
}

export interface DispatchReceipt {
  success: boolean;
  timestamp: string;
  notifications: {
    guestSms?: string;
    guestEmail?: string;
    agentSms?: string;
    agentEmail?: string;
  };
}

/**
 * Randevu onaylandığında (CONFIRMED) veya iptal edildiğinde (CANCELLED)
 * hem müşteriye hem de emlakçıya anında bildirim gönderir.
 */
export async function dispatchAppointmentNotification(data: {
  status: "CONFIRMED" | "CANCELLED";
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  propertyTitle: string;
  dateStr: string;
  tourType?: "PHYSICAL" | "ONLINE_VIDEO";
}): Promise<DispatchReceipt> {
  const isConfirmed = data.status === "CONFIRMED";
  const tourLabel =
    data.tourType === "ONLINE_VIDEO" ? "Online Canlı Video Turu" : "Yerinde VIP Özel Gösterim";
  const agent = data.agentName || "Derin Soydan (Kıdemli Broker)";

  // 1. Müşteri SMS İçeriği
  const guestSms = isConfirmed
    ? `[LUMIÈRE LUXURY] Sayın ${data.guestName}, "${data.propertyTitle}" için ${data.dateStr} tarihli ${tourLabel} randevunuz ONAYLANDI. Özel danışmanınız: ${agent}. İrtibat: +90 (212) 800 40 50.`
    : `[LUMIÈRE LUXURY] Sayın ${data.guestName}, "${data.propertyTitle}" için talep ettiğiniz ${data.dateStr} randevusu maalesef onaylanamadı. Danışmanımız alternatif saatler için sizinle iletişime geçecektir.`;

  // 2. Müşteri E-Posta İçeriği
  const guestEmail = isConfirmed
    ? `Konu: Randevunuz Onaylandı | ${data.propertyTitle}\nSayın ${data.guestName},\n${data.dateStr} tarihinde gerçekleşecek ${tourLabel} rezervasyonunuz onaylanmıştır. Takvim davetiyesi (.ics) eklenmiştir.\nDanışman: ${agent}`
    : `Konu: Randevu Durumu Güncellemesi | ${data.propertyTitle}\nSayın ${data.guestName},\n${data.dateStr} tarihli randevunuz iptal edilmiştir.`;

  // 3. Emlakçı (Agent) Bildirimleri
  const agentSms = isConfirmed
    ? `[LUMIÈRE AJANS] Sayın ${agent}, ${data.guestName} (${data.guestPhone}) adına "${data.propertyTitle}" için ${data.dateStr} tarihli ${tourLabel} onaylandı. Takviminize işlendi.`
    : `[LUMIÈRE AJANS] "${data.propertyTitle}" için ${data.guestName} randevusu İPTAL EDİLDİ.`;

  const agentEmail = `Konu: ${isConfirmed ? "Yeni Onaylanan Randevu" : "İptal Edilen Randevu"} - ${data.guestName}\nMülk: ${data.propertyTitle}\nTarih: ${data.dateStr}\nTür: ${tourLabel}\nMüşteri İletişim: ${data.guestPhone} / ${data.guestEmail}`;

  // Log simulation to console (Twilio / SendGrid mock)
  console.log("=================================================");
  console.log("📨 [SMS SERVICE DISPATCH]");
  console.log(`-> Gönderilen Müşteri: ${data.guestPhone}`);
  console.log(`-> Mesaj: ${guestSms}`);
  console.log("-------------------------------------------------");
  console.log("📧 [EMAIL SERVICE DISPATCH]");
  console.log(`-> Gönderilen Müşteri: ${data.guestEmail}`);
  console.log(`-> Konu: ${guestEmail.split("\n")[0]}`);
  console.log("-------------------------------------------------");
  console.log(`-> Danışman SMS (${data.agentPhone || "+90 532 100 00 00"}): ${agentSms}`);
  console.log("=================================================");

  return {
    success: true,
    timestamp: new Date().toISOString(),
    notifications: {
      guestSms,
      guestEmail,
      agentSms,
      agentEmail,
    },
  };
}

