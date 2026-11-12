"use client";

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  Plane,
  Anchor,
  Car,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Building,
} from "lucide-react";
import { createAppointment } from "@/lib/actions/appointment";

export interface TourBookingWidgetProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: string;
  className?: string;
}

const TIME_SLOTS = [
  "10:00",
  "11:30",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
];

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

export function TourBookingWidget({
  propertyId,
  propertyTitle,
  propertyPrice,
  className = "",
}: TourBookingWidgetProps) {
  const [tourType, setTourType] = useState<"PHYSICAL" | "ONLINE_VIDEO">("PHYSICAL");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 86400000)); // Default tomorrow
  const [selectedSlot, setSelectedSlot] = useState<string>("14:00");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [vipTransfer, setVipTransfer] = useState<"HELICOPTER" | "CHAUFFEUR" | "YACHT" | "NONE">("CHAUFFEUR");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string>("");

  const handleDateChange = (val: CalendarValue) => {
    if (val instanceof Date) {
      setSelectedDate(val);
    } else if (Array.isArray(val) && val[0] instanceof Date) {
      setSelectedDate(val[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg("Lütfen isim, e-posta ve telefon numaranızı giriniz.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateFormatted = `${year}-${month}-${day}`;

    try {
      const res = await createAppointment({
        propertyId,
        propertyTitle,
        guestName,
        guestEmail,
        guestPhone,
        date: dateFormatted,
        timeSlot: selectedSlot,
        tourType,
        vipTransfer: tourType === "PHYSICAL" ? vipTransfer : "NONE",
        agencyNotes: notes,
      });

      if (res.success) {
        setIsSuccess(true);
        setBookingRef(res.appointmentId || `LUM-${Math.floor(100000 + Math.random() * 900000)}`);
      } else {
        setErrorMsg(res.error || "Randevu talebi iletilemedi.");
      }
    } catch {
      setErrorMsg("Sunucuyla bağlantı kurulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedSelectedDate = selectedDate.toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`rounded-3xl border border-gold-500/30 bg-card/75 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-foreground space-y-6 ${className}`}
    >
      {/* Widget Header */}
      <div className="border-b border-border/70 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[11px] font-semibold text-gold-400 mb-2">
          <Sparkles className="h-3 w-3 text-gold-400" />
          <span>Akıllı Takvim &amp; VIP Rezervasyon</span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Ev Turu Randevusu Al
        </h3>
        {propertyPrice && (
          <p className="text-xs font-serif font-bold text-gold-400 mt-0.5">
            Portföy Değeri: {propertyPrice}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Emlakçının takvimiyle canlı senkronize, form doldurup beklemeden anında saat dilimi belirleyin.
        </p>
      </div>

      {isSuccess ? (
        /* =========================================================================
           SUCCESS SCREEN: Booking Receipt & Confirmation
           ========================================================================= */
        <div className="py-6 space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/40 bg-gold-gradient shadow-gold-sm">
            <CheckCircle2 className="h-8 w-8 text-black" />
          </div>

          <div>
            <h4 className="font-serif text-2xl font-bold text-foreground">
              Randevu Talebiniz Alındı!
            </h4>
            <div className="mt-1 inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Durum: PENDING (Beklemede)
              </span>
            </div>
          </div>

          {/* Receipt Card */}
          <div className="rounded-2xl border border-gold-500/20 bg-background/60 p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Rezervasyon No:</span>
              <span className="font-mono font-bold text-gold-400">{bookingRef}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Mülk:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {propertyTitle}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Tur Türü:</span>
              <span className="font-bold text-foreground">
                {tourType === "PHYSICAL" ? "🏛️ Yerinde VIP Tur" : "💻 Online Canlı Video Turu"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Tarih &amp; Saat:</span>
              <span className="font-semibold text-gold-400">
                {formattedSelectedDate} · {selectedSlot}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Misafir:</span>
              <span className="font-semibold text-foreground">{guestName}</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Danışmanımız Derin Soydan talebi onayladığında <strong>{guestPhone}</strong> numarasına SMS ve <strong>{guestEmail}</strong> adresinize Google Calendar (.ics) davetiyesi iletilecektir.
          </p>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setGuestName("");
              setGuestEmail("");
              setGuestPhone("");
            }}
            className="w-full rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Farklı Bir Randevu Oluştur
          </button>
        </div>
      ) : (
        /* =========================================================================
           BOOKING FORM: Step-by-Step Interactive Widget
           ========================================================================= */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: Tour Type Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">
              1. Gösterim Türünü Seçin
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTourType("PHYSICAL")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  tourType === "PHYSICAL"
                    ? "border-gold-500 bg-gold-500/10 text-gold-300 ring-2 ring-gold-500/20 shadow-gold-sm"
                    : "border-border bg-background/50 text-muted-foreground hover:border-gold-500/30 hover:text-foreground"
                }`}
              >
                <Building className="h-5 w-5 mb-1 text-gold-400" />
                <span className="text-xs font-bold">Yerinde Fiziksel Tur</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Özel karşılama &amp; sunum
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTourType("ONLINE_VIDEO")}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  tourType === "ONLINE_VIDEO"
                    ? "border-gold-500 bg-gold-500/10 text-gold-300 ring-2 ring-gold-500/20 shadow-gold-sm"
                    : "border-border bg-background/50 text-muted-foreground hover:border-gold-500/30 hover:text-foreground"
                }`}
              >
                <Video className="h-5 w-5 mb-1 text-sky-400" />
                <span className="text-xs font-bold">Online Canlı Görüşme</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  4K HDR &amp; 360 VR yayın
                </span>
              </button>
            </div>
          </div>

          {/* STEP 2: Interactive React-Calendar Date Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-gold-400" />
                <span>2. Tarih Belirleyin</span>
              </label>
              <span className="text-[11px] font-semibold text-gold-400">
                {formattedSelectedDate}
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-background/50 p-2.5">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                locale="tr-TR"
              />
            </div>
          </div>

          {/* STEP 3: Time Slot Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold-400" />
                <span>3. Müsait Saat Dilimi</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                ● Temsilci Müsait
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    selectedSlot === slot
                      ? "border border-gold-500 bg-gold-gradient text-black shadow-gold-sm scale-102"
                      : "border border-border bg-card/60 text-muted-foreground hover:border-gold-500/40 hover:text-foreground"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 4: VIP Transfer Options (If Physical Tour) */}
          {tourType === "PHYSICAL" && (
            <div>
              <label className="block text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">
                VIP Karşılama &amp; Transfer Tercihi
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVipTransfer("CHAUFFEUR")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                    vipTransfer === "CHAUFFEUR"
                      ? "border-gold-500 bg-gold-500/10 text-gold-400"
                      : "border-border bg-card/60 text-muted-foreground"
                  }`}
                >
                  <Car className="h-4 w-4 mb-0.5" />
                  <span>VIP Şoför</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVipTransfer("HELICOPTER")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                    vipTransfer === "HELICOPTER"
                      ? "border-gold-500 bg-gold-500/10 text-gold-400"
                      : "border-border bg-card/60 text-muted-foreground"
                  }`}
                >
                  <Plane className="h-4 w-4 mb-0.5" />
                  <span>Helikopter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVipTransfer("YACHT")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                    vipTransfer === "YACHT"
                      ? "border-gold-500 bg-gold-500/10 text-gold-400"
                      : "border-border bg-card/60 text-muted-foreground"
                  }`}
                >
                  <Anchor className="h-4 w-4 mb-0.5" />
                  <span>Özel Yat</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Guest Contact Details */}
          <div className="space-y-3 pt-1">
            <label className="block text-[11px] font-bold text-foreground uppercase tracking-wider">
              4. İletişim Bilgileriniz
            </label>

            <div>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Adınız ve Soyadınız"
                className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none placeholder-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="E-Posta Adresiniz"
                  className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none placeholder-muted-foreground"
                />
              </div>

              <div>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+90 (5XX) XXX XX XX"
                  className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none placeholder-muted-foreground"
                />
              </div>
            </div>

            <div>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Varsa özel istekleriniz veya temsilciye notunuz..."
                className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none placeholder-muted-foreground resize-none"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
              {errorMsg}
            </p>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gold-500 bg-gold-gradient py-3.5 text-xs sm:text-sm font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                <span>Rezervasyon İletiliyor...</span>
              </>
            ) : (
              <>
                <span>Randevu Talebini Onaya Gönder</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Privacy & NDA Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center">
            <ShieldCheck className="h-3 w-3 text-gold-400" />
            <span>Kişisel verileriniz ve gösterim detayları NDA gizliliği altındadır.</span>
          </div>
        </form>
      )}
    </div>
  );
}
