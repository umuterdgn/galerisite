"use client";

import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gem,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building,
  LayoutDashboard,
} from "lucide-react";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const emailField = register("email");
  const passwordField = register("password");

  // Quick Demo Fast-Login Pills
  const handleFastFill = (fillEmail: string, fillPass: string) => {
    setValue("email", fillEmail, { shouldValidate: true, shouldDirty: true });
    setValue("password", fillPass, { shouldValidate: true, shouldDirty: true });
    setAuthError(null);
  };

  const onSubmit = async (data: AdminLoginInput) => {
    setAuthError(null);

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!res || res.error || !res.ok) {
        setAuthError(
          res?.error || "E-posta veya şifre hatalı. Lütfen tekrar deneyiniz."
        );
        return;
      }

      // Başarılı girişte kullanıcıyı kesinlikle /admin/dashboard sayfasına yönlendir
      setIsRedirecting(true);
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Sign-in error:", err);
      setAuthError("Kimlik doğrulama sunucusuna bağlanılamadı.");
    }
  };

  const isBusy = isSubmitting || isRedirecting;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#06070a] text-foreground">
      {/* Background Ambient Luxury Light Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gold-500/10 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-navy-600/15 blur-[150px]" />
      <div className="pointer-events-none absolute inset-0 bg-luxury-mesh opacity-40" />

      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-gold-500/30 bg-card/75 p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl"
      >
        {/* Brand Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/40 bg-gold-gradient shadow-gold-sm">
            <Gem className="h-7 w-7 text-obsidian-950" />
            <div className="absolute -inset-1 rounded-2xl bg-gold-400/30 blur-md -z-10 animate-pulse" />
          </div>

          <h1 className="mt-5 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            LUMIÈRE PRIME
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-gold-400 font-semibold">
            B2B Luxury Agency Portal
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Çok kiracılı (Multi-tenant) ajans ve broker yönetim konsoluna erişin.
          </p>
        </div>

        {/* Active Session Banner if already signed in */}
        {session?.user && (
          <div className="mt-5 flex items-center justify-between gap-2 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs">
            <div className="truncate">
              <span className="text-[10px] uppercase tracking-wider text-gold-400 font-bold block">
                Aktif Oturum
              </span>
              <span className="font-semibold text-foreground truncate block">
                {session.user.name || session.user.email}
              </span>
            </div>
            <Link
              href="/admin/dashboard"
              prefetch={false}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gold-gradient px-3 py-1.5 text-[11px] font-bold text-black shadow-gold-sm hover:brightness-110"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Panele Git</span>
            </Link>
          </div>
        )}

        {/* Authentication Error Alert */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* React Hook Form + Zod Validated Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-5">
          {/* Email Floating Label Input */}
          <div className="space-y-1.5">
            <div className="relative group">
              <div
                className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                  errors.email
                    ? "border-red-500/70 ring-2 ring-red-500/15 bg-background/90"
                    : emailFocused || emailValue
                    ? "border-gold-500 ring-2 ring-gold-500/20 bg-background/90"
                    : "border-border bg-card/60 hover:border-gold-500/40"
                }`}
              >
                <div className="pl-4 text-muted-foreground group-hover:text-gold-400 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>

                {/* Floating Label */}
                <label
                  htmlFor="email"
                  className={`pointer-events-none absolute left-11 transition-all duration-200 ${
                    emailFocused || emailValue
                      ? "-top-2.5 bg-[#06070a] px-2 text-[10px] font-bold uppercase tracking-wider text-gold-400 rounded-md border border-gold-500/30"
                      : "top-3.5 text-xs text-muted-foreground"
                  }`}
                >
                  Kurumsal E-Posta
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...emailField}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={(e) => {
                    emailField.onBlur(e);
                    setEmailFocused(false);
                  }}
                  className="w-full bg-transparent px-3 py-3.5 text-xs sm:text-sm font-medium text-foreground outline-none"
                />
              </div>
            </div>
            {errors.email && (
              <p className="px-2 text-[11px] font-medium text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Floating Label Input */}
          <div className="space-y-1.5">
            <div className="relative group">
              <div
                className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                  errors.password
                    ? "border-red-500/70 ring-2 ring-red-500/15 bg-background/90"
                    : passwordFocused || passwordValue
                    ? "border-gold-500 ring-2 ring-gold-500/20 bg-background/90"
                    : "border-border bg-card/60 hover:border-gold-500/40"
                }`}
              >
                <div className="pl-4 text-muted-foreground group-hover:text-gold-400 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>

                {/* Floating Label */}
                <label
                  htmlFor="password"
                  className={`pointer-events-none absolute left-11 transition-all duration-200 ${
                    passwordFocused || passwordValue
                      ? "-top-2.5 bg-[#06070a] px-2 text-[10px] font-bold uppercase tracking-wider text-gold-400 rounded-md border border-gold-500/30"
                      : "top-3.5 text-xs text-muted-foreground"
                  }`}
                >
                  Gizli Şifre
                </label>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...passwordField}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={(e) => {
                    passwordField.onBlur(e);
                    setPasswordFocused(false);
                  }}
                  className="w-full bg-transparent px-3 py-3.5 text-xs sm:text-sm font-medium text-foreground outline-none pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  className="absolute right-3 text-muted-foreground hover:text-gold-400 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="px-2 text-[11px] font-medium text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isBusy}
            className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-gold-500 bg-gold-gradient py-3.5 text-xs sm:text-sm font-bold text-black shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isBusy ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>
                  {isRedirecting ? "Panele Yönlendiriliyor..." : "Yetkilendiriliyor..."}
                </span>
              </div>
            ) : (
              <>
                <span>Güvenli Giriş Yap</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Fill Test Credentials */}
        <div className="mt-8 border-t border-border/80 pt-6">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span>Hızlı Test Hesapları (Demo)</span>
            </span>
            <span className="text-[10px] text-gold-400/80">RBAC Aktif</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleFastFill("owner@lumiere.luxury", "Lumiere2026!")}
              className="rounded-xl border border-gold-500/30 bg-gold-500/5 p-2.5 text-left transition-all hover:border-gold-500/60 hover:bg-gold-500/10 group"
            >
              <div className="flex items-center gap-1.5 text-gold-400 font-bold text-xs">
                <Building className="h-3.5 w-3.5" />
                <span>Ajans Sahibi</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                owner@lumiere.luxury
              </p>
              <span className="text-[9px] text-emerald-400 font-medium">AGENCY_OWNER</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastFill("agent@lumiere.luxury", "Lumiere2026!")}
              className="rounded-xl border border-border bg-card/60 p-2.5 text-left transition-all hover:border-gold-500/40 hover:bg-card group"
            >
              <div className="flex items-center gap-1.5 text-foreground font-bold text-xs group-hover:text-gold-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Broker / Emlakçı</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                agent@lumiere.luxury
              </p>
              <span className="text-[9px] text-gold-400/90 font-medium">AGENT</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          256-bit SSL ve JWT şifreli kurumsal oturum. © 2026 Lumière SaaS.
        </p>
      </motion.div>
    </div>
  );
}
