"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyInquirySchema, type PropertyInquiryInput } from "@/lib/validations/property";
import { Send, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function PropertyInquiryForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInquiryInput>({
    resolver: zodResolver(propertyInquirySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      agencyName: "",
      isB2BPartner: true,
      message: "",
    },
  });

  const onSubmit = async (data: PropertyInquiryInput) => {
    // Simulated submission to API / Prisma backend
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Inquiry Submitted:", data);
    setIsSuccess(true);
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-gold-500/20 bg-card/60 p-6 md:p-8 backdrop-blur-xl shadow-luxury-glass"
    >
      <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-background/90 px-3 py-1 text-xs font-semibold text-gold-400">
        <Sparkles className="h-3 w-3 text-gold-400" />
        B2B Private Syndication
      </div>

      <div className="mb-6 mt-2">
        <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Ajans & Portföy Ortaklığı Talebi
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Özel mülk portföyünüze erişim sağlamak veya sistemimize ajansınızı entegre etmek için formu doldurun.
        </p>
      </div>

      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-gold-500/30 bg-gold-500/10 p-6 text-center"
        >
          <CheckCircle2 className="mx-auto h-12 w-12 text-gold-400" />
          <h4 className="mt-3 font-serif text-xl font-bold text-foreground">
            Talebiniz Alındı
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Özel B2B temsilcimiz 24 saat içinde gizlilik protokolü ile tarafınıza dönüş yapacaktır.
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="mt-4 inline-flex items-center rounded-lg border border-gold-500/40 px-4 py-2 text-xs font-medium text-gold-400 hover:bg-gold-500/20 transition-colors"
          >
            Yeni Talep Gönder
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ad Soyad
              </label>
              <input
                {...register("fullName")}
                placeholder="Örn: Alexander Vance"
                className="mt-1 w-full rounded-lg border border-border bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Kurumsal E-Posta
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="vance@luxuryrealty.com"
                className="mt-1 w-full rounded-lg border border-border bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                İletişim Numarası
              </label>
              <input
                {...register("phone")}
                placeholder="+90 532 000 0000"
                className="mt-1 w-full rounded-lg border border-border bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ajans / Şirket Adı
              </label>
              <input
                {...register("agencyName")}
                placeholder="Örn: Sotheby's Partner / Prime Realty"
                className="mt-1 w-full rounded-lg border border-border bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Talep & Portföy Notları
            </label>
            <textarea
              {...register("message")}
              rows={3}
              placeholder="İlgilendiğiniz mülk kategorileri, şehirler veya ajansınızın portföy hacmi..."
              className="mt-1 w-full rounded-lg border border-border bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold-400" />
            <span>Tüm veri paylaşımları 256-bit NDA ve şifreleme altındadır.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gold-gradient px-6 py-3 text-sm font-semibold text-obsidian-950 shadow-gold-sm transition-all duration-300 hover:shadow-gold-md hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{isSubmitting ? "Gönderiliyor..." : "Özel Ortaklık Başvurusu Yap"}</span>
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      )}
    </motion.div>
  );
}

