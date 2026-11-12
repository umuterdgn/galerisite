"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plane,
  Anchor,
  Send,
  Loader2,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAppointment } from "@/lib/actions/appointment";

export interface AppointmentModalProps {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

export function AppointmentModal({
  propertyId,
  propertyTitle,
  className = "",
}: AppointmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    date: "",
    vipTransfer: "HELICOPTER" as "HELICOPTER" | "CHAUFFEUR" | "YACHT" | "NONE",
    ndaAccepted: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guestName || !formData.guestEmail || !formData.date) {
      setErrorMsg("Lütfen isim, e-posta ve gösterim tarihini giriniz.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await createAppointment({
      propertyId,
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      guestPhone: formData.guestPhone,
      date: formData.date,
      vipTransfer: formData.vipTransfer,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMsg(res.error || "Randevu talebi iletilemedi.");
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setErrorMsg(null);
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gold-gradient px-6 py-3.5 text-sm font-semibold text-obsidian-950 shadow-gold-sm transition-all duration-300 hover:shadow-gold-md hover:brightness-105 active:scale-[0.98] ${className}`}
      >
        <Calendar className="h-4 w-4" />
        <span>VIP Özel Gösterim Randevusu Al</span>
      </button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gold-500/30 bg-card/95 p-6 sm:p-8 text-foreground backdrop-blur-2xl shadow-luxury-glass z-10 my-8"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-gold-500/40 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {isSuccess ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/40 bg-gold-500/10 text-gold-400 shadow-gold-sm">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">
                    VIP Gösterim Talebiniz Alındı
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">{propertyTitle}</strong> için belirlediğiniz tarihte özel portföy direktörümüz ve konsiyerj ekibimiz sizinle iletişime geçecektir.
                  </p>

                  <div className="mt-6 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-4 text-xs text-muted-foreground text-left space-y-1">
                    <p className="font-semibold text-gold-400">Protokol Detayları:</p>
                    <p>• Tarih: {formData.date || "Belirlenen Tarih"}</p>
                    <p>• Transfer: {formData.vipTransfer === "HELICOPTER" ? "Özel Helikopter" : formData.vipTransfer === "YACHT" ? "Özel Yat İskelesi" : "Şoförlü Karşılama"}</p>
                    <p>• Güvenlik: 256-bit NDA ve Biyometrik Doğrulama</p>
                  </div>

                  <Button
                    variant="gold"
                    size="md"
                    onClick={closeModal}
                    className="mt-6 w-full"
                  >
                    Kapat
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Badge variant="gold" className="text-[10px] mb-2">
                      <Clock className="h-3 w-3 text-gold-400" />
                      <span>Gizlilik & Akredite Sunum</span>
                    </Badge>
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                      Özel Gösterim Randevusu
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {propertyTitle}
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                      {errorMsg}
                    </div>
                  )}

                  {/* Date & Time Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Talep Edilen Gösterim Tarihi & Saati
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs text-foreground focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                  {/* Personal Contact Info */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <User className="h-3 w-3 text-gold-400" />
                        <span>Ad Soyad / Unvan</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Lord Julian Sterling"
                        value={formData.guestName}
                        onChange={(e) =>
                          setFormData({ ...formData, guestName: e.target.value })
                        }
                        className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gold-400" />
                        <span>Kurumsal / Özel E-posta</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sterling@familyoffice.com"
                        value={formData.guestEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, guestEmail: e.target.value })
                        }
                        className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gold-400" />
                      <span>Telefon / WhatsApp Hattı</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+90 532 000 0000"
                      value={formData.guestPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, guestPhone: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  {/* VIP Transfer Option */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Özel Transfer Talebi (Konsiyerj)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: "HELICOPTER" as const, label: "Helikopter", icon: Plane },
                        { type: "YACHT" as const, label: "Yat İskelesi", icon: Anchor },
                        { type: "CHAUFFEUR" as const, label: "VIP Şoför", icon: ShieldCheck },
                      ].map(({ type, label, icon: Icon }) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, vipTransfer: type })}
                          className={`flex flex-col items-center justify-center rounded-xl p-2.5 border text-xs transition-colors ${
                            formData.vipTransfer === type
                              ? "border-gold-500 bg-gold-500/15 text-gold-400 font-semibold"
                              : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 mb-1 text-gold-400" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NDA Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.ndaAccepted}
                      onChange={(e) =>
                        setFormData({ ...formData, ndaAccepted: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-border text-gold-500 focus:ring-gold-500 mt-0.5"
                    />
                    <span className="text-[11px] leading-snug text-muted-foreground">
                      Mülk sahibi mahremiyeti gereği paylaşılan mimari çizimler ve finansal veriler <strong>Gizlilik Anlaşması (NDA)</strong> kapsamındadır.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Randevuyu Onayla & Gönder</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

