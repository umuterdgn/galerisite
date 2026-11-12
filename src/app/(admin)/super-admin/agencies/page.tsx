"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Crown,
  Building2,
  Plus,
  Search,
  Users,
  Home,
  Ban,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Wand2,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AgencyListItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  themeColor: string;
  isActive: boolean;
  suspendedAt: string | null;
  createdAt: string;
  _count: {
    users: number;
    properties: number;
  };
  users: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
}

interface AgenciesSummary {
  totalAgencies: number;
  activeAgencies: number;
  suspendedAgencies: number;
  totalUsers: number;
  totalProperties: number;
}

const createAgencyFormSchema = z.object({
  agencyName: z
    .string()
    .trim()
    .min(2, "Ajans adı en az 2 karakter olmalıdır.")
    .max(120, "Ajans adı 120 karakteri geçemez."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Alt alan adı (slug) en az 2 karakter olmalıdır.")
    .max(60, "Slug en fazla 60 karakter olabilir.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Yalnızca küçük harf, rakam ve tire (-) kullanabilirsiniz. Örn: elit"
    ),
  ownerName: z
    .string()
    .trim()
    .min(2, "Ajans sahibinin adı soyadı en az 2 karakter olmalıdır."),
  ownerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi giriniz."),
  tempPassword: z
    .string()
    .min(6, "Geçici şifre en az 6 karakter olmalıdır.")
    .max(100),
});

type CreateAgencyFormValues = z.infer<typeof createAgencyFormSchema>;

function slugifyTurkish(value: string): string {
  const charMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    I: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };
  return value
    .split("")
    .map((ch) => charMap[ch] || ch)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  let result = "Lmr!";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function SuperAdminAgenciesPage() {
  const [agencies, setAgencies] = useState<AgencyListItem[]>([]);
  const [summary, setSummary] = useState<AgenciesSummary>({
    totalAgencies: 0,
    activeAgencies: 0,
    suspendedAgencies: 0,
    totalUsers: 0,
    totalProperties: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgencyFormValues>({
    resolver: zodResolver(createAgencyFormSchema),
    defaultValues: {
      agencyName: "",
      slug: "",
      ownerName: "",
      ownerEmail: "",
      tempPassword: "",
    },
  });

  const watchedAgencyName = watch("agencyName");
  const watchedSlug = watch("slug");

  useEffect(() => {
    if (!isSlugManuallyEdited && watchedAgencyName !== undefined) {
      setValue("slug", slugifyTurkish(watchedAgencyName), {
        shouldValidate: watchedAgencyName.length > 1,
      });
    }
  }, [watchedAgencyName, isSlugManuallyEdited, setValue]);

  const fetchAgencies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/super-admin/agencies", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Ajans listesi alınamadı.");
      }
      setAgencies(data.agencies || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Veriler yüklenirken hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  const openCreateModal = () => {
    setIsSlugManuallyEdited(false);
    setShowPassword(false);
    reset({
      agencyName: "",
      slug: "",
      ownerName: "",
      ownerEmail: "",
      tempPassword: generateTempPassword(),
    });
    setIsModalOpen(true);
  };

  const onSubmitCreateAgency = async (values: CreateAgencyFormValues) => {
    setToast(null);
    try {
      const res = await fetch("/api/super-admin/create-agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError("root", {
          message: data?.error || "Ajans oluşturulamadı.",
        });
        return;
      }

      setToast({
        type: "success",
        text: `✓ "${values.agencyName}" (${values.slug}.emlaksaas.com) ve sahibi "${values.ownerName}" (AGENCY_OWNER) Prisma Transaction ile başarıyla oluşturuldu.`,
      });
      setIsModalOpen(false);
      await fetchAgencies();
    } catch {
      setError("root", {
        message: "Sunucuya bağlanırken beklenmedik bir hata oluştu.",
      });
    }
  };

  const handleToggleSuspend = async (agency: AgencyListItem) => {
    const nextActive = !agency.isActive;
    const actionLabel = nextActive ? "aktifleştirmek" : "askıya almak";

    if (
      !confirm(
        `"${agency.name}" ajansının sistem erişimini ${actionLabel} istediğinize emin misiniz?`
      )
    ) {
      return;
    }

    setActionLoadingId(agency.id);
    setToast(null);
    try {
      const res = await fetch(`/api/super-admin/agencies/${agency.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Ajans durumu güncellenemedi.");
      }

      setToast({
        type: "success",
        text: nextActive
          ? `✓ "${agency.name}" ajansı yeniden aktifleştirildi.`
          : `⚠ "${agency.name}" ajansının sistem erişimi askıya alındı.`,
      });
      await fetchAgencies();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Durum güncellenemedi.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAgency = async (agency: AgencyListItem) => {
    if (
      !confirm(
        `DİKKAT: "${agency.name}" ajansı ile birlikte ajansa bağlı ${agency._count.users} kullanıcı ve ${agency._count.properties} ilan kalıcı olarak silinecektir. Onaylıyor musunuz?`
      )
    ) {
      return;
    }

    setActionLoadingId(agency.id);
    setToast(null);
    try {
      const res = await fetch(`/api/super-admin/agencies/${agency.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Ajans silinemedi.");
      }

      setToast({
        type: "success",
        text: `"${agency.name}" ajansı ve tüm bağlı kayıtları platformdan kaldırıldı.`,
      });
      await fetchAgencies();
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Silme işlemi başarısız.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAgencies = agencies.filter((agency) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && agency.isActive) ||
      (statusFilter === "SUSPENDED" && !agency.isActive);

    const q = searchQuery.trim().toLowerCase();
    const owner = agency.users[0];
    const matchesQuery =
      !q ||
      agency.name.toLowerCase().includes(q) ||
      agency.slug.toLowerCase().includes(q) ||
      (owner?.fullName || "").toLowerCase().includes(q) ||
      (owner?.email || "").toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              SaaS Master Platform Konsolu
            </span>
            <Badge variant="gold" className="text-[10px]">
              <ShieldCheck className="mr-1 h-3 w-3" />
              SUPERADMIN ONLY
            </Badge>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <span>Müşteri &amp; Ajans (Tenant) Yönetimi</span>
            <Crown className="h-6 w-6 text-gold-400" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Platformu kiralayan emlak ajanslarını tanımlayın, ilk `AGENCY_OWNER` hesabını atomik olarak oluşturun ve erişimleri yönetin.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={openCreateModal}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Ajans Ekle</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Toplam Ajans</span>
            <Building2 className="h-4 w-4 text-gold-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground">
            {summary.totalAgencies}
          </p>
          <p className="mt-1 text-[11px] text-emerald-400">
            {summary.activeAgencies} aktif · {summary.suspendedAgencies} askıda
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Aktif Kiracılar</span>
            <Globe className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground">
            {summary.activeAgencies}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Yayındaki SaaS subdomainleri
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Toplam Personel</span>
            <Users className="h-4 w-4 text-gold-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground">
            {summary.totalUsers}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Ajans sahipleri &amp; danışmanlar
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Toplam İlan</span>
            <Home className="h-4 w-4 text-gold-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-bold text-foreground">
            {summary.totalProperties}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Platform genelindeki portföy
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`rounded-2xl p-4 text-xs flex items-center justify-between gap-3 ${
            toast.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ajans adı, slug, sahip adı veya e-posta ara..."
            className="w-full rounded-xl border border-border bg-card/80 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { id: "ALL", label: "Tümü" },
              { id: "ACTIVE", label: "Aktif" },
              { id: "SUSPENDED", label: "Askıda" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-gold-500/20 text-gold-400 border border-gold-500/40"
                  : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agencies Data Table */}
      <div className="rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-xl shadow-xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-gold-400" />
            <span>Ajanslar ve tenant istatistikleri yükleniyor...</span>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="text-center py-14 space-y-3">
            <Building2 className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <p className="text-sm font-semibold text-foreground">
              Kriterlere uygun kayıtlı ajans bulunamadı
            </p>
            <p className="text-xs text-muted-foreground">
              Yeni bir emlak ajansı eklemek için &quot;Yeni Ajans Ekle&quot; butonunu kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Ajans &amp; Alt Alan Adı</th>
                  <th className="pb-3 font-medium">Ajans Sahibi</th>
                  <th className="pb-3 font-medium">Personel</th>
                  <th className="pb-3 font-medium">Toplam İlan</th>
                  <th className="pb-3 font-medium">Durum</th>
                  <th className="pb-3 font-medium">Kayıt Tarihi</th>
                  <th className="pb-3 font-medium text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {filteredAgencies.map((agency) => {
                  const owner = agency.users[0];
                  const isBusy = actionLoadingId === agency.id;

                  return (
                    <tr
                      key={agency.id}
                      className="hover:bg-card/80 transition-colors group"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/30 font-serif text-sm font-bold text-foreground shadow-sm"
                            style={{
                              backgroundColor: `${agency.themeColor || "#D4AF37"}20`,
                              borderColor: `${agency.themeColor || "#D4AF37"}55`,
                            }}
                          >
                            {agency.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {agency.name}
                            </p>
                            <p className="text-[11px] font-mono text-gold-400/90 mt-0.5 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {agency.slug}.emlaksaas.com
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        {owner ? (
                          <div>
                            <p className="font-medium text-foreground">
                              {owner.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-gold-400/80" />
                              {owner.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            Sahip tanımlı değil
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 font-medium text-foreground">
                          <Users className="h-3.5 w-3.5 text-gold-400" />
                          <span>{agency._count.users}</span>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1 font-medium text-foreground">
                          <Home className="h-3.5 w-3.5 text-gold-400" />
                          <span>{agency._count.properties}</span>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        {agency.isActive ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          >
                            Aktif Erişim
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-red-500/40 bg-red-500/10 text-red-400"
                          >
                            Askıya Alındı
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 pr-4 text-muted-foreground whitespace-nowrap">
                        {new Date(agency.createdAt).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleToggleSuspend(agency)}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                              agency.isActive
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                            title={
                              agency.isActive
                                ? "Ajans Erişimini Askıya Al"
                                : "Ajansı Yeniden Aktifleştir"
                            }
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : agency.isActive ? (
                              <Ban className="h-3.5 w-3.5" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {agency.isActive ? "Askıya Al" : "Aktifleştir"}
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteAgency(agency)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-red-400 hover:border-red-500/40 transition-colors disabled:opacity-50"
                            title="Ajansı ve Bağlı Kayıtları Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Agency Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-gold-500/30 bg-card p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-full border border-border p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-gold-400">
                <Crown className="h-3.5 w-3.5" />
                <span>Prisma Atomik Tenant Kurulumu</span>
              </div>
              <h2 className="mt-1 font-serif text-xl font-bold text-foreground">
                Yeni Emlak Ajansı &amp; Yönetici Oluştur
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Ajans kaydı ile birlikte ilk `AGENCY_OWNER` hesabı tek bir PostgreSQL transaction içinde oluşturulur.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitCreateAgency)}
              className="space-y-4 text-xs"
            >
              {errors.root && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.root.message}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Ajans Adı
                </label>
                <input
                  {...register("agencyName")}
                  placeholder="Örn: Elit Gayrimenkul"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                />
                {errors.agencyName && (
                  <p className="text-red-400 mt-1">{errors.agencyName.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Sistem Alt Alan Adı / Slug
                </label>
                <div className="flex items-center rounded-xl border border-border bg-background focus-within:border-gold-500 overflow-hidden">
                  <input
                    {...register("slug")}
                    onChange={(e) => {
                      setIsSlugManuallyEdited(true);
                      setValue("slug", e.target.value.toLowerCase(), {
                        shouldValidate: true,
                      });
                    }}
                    placeholder="Örn: elit"
                    className="flex-1 bg-transparent px-3.5 py-2.5 text-foreground font-mono focus:outline-none"
                  />
                  <span className="border-l border-border bg-card/70 px-3 py-2.5 text-[11px] font-mono text-muted-foreground">
                    .emlaksaas.com
                  </span>
                </div>
                {watchedSlug && !errors.slug && (
                  <p className="mt-1 text-[11px] text-gold-400/90 font-mono">
                    Tenant Adresi: https://{watchedSlug}.emlaksaas.com
                  </p>
                )}
                {errors.slug && (
                  <p className="text-red-400 mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Ajans Sahibinin Adı Soyadı
                  </label>
                  <input
                    {...register("ownerName")}
                    placeholder="Örn: Demir Yılmaz"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                  {errors.ownerName && (
                    <p className="text-red-400 mt-1">{errors.ownerName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Ajans Sahibinin E-posta Adresi
                  </label>
                  <input
                    type="email"
                    {...register("ownerEmail")}
                    placeholder="demir@elitgayrimenkul.com"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                  {errors.ownerEmail && (
                    <p className="text-red-400 mt-1">{errors.ownerEmail.message}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground">
                    Geçici Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setValue("tempPassword", generateTempPassword(), {
                        shouldValidate: true,
                      })
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-400 hover:underline"
                  >
                    <Wand2 className="h-3 w-3" />
                    <span>Güçlü Şifre Üret</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("tempPassword")}
                    placeholder="En az 6 karakter geçici şifre"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2.5 font-mono text-foreground focus:border-gold-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.tempPassword && (
                  <p className="text-red-400 mt-1">{errors.tempPassword.message}</p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Vazgeç
                </Button>
                <Button type="submit" variant="gold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Transaction Çalışıyor...
                    </span>
                  ) : (
                    "Ajansı ve Sahibini Oluştur"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

