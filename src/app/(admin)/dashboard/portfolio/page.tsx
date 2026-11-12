"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PropertyStatus } from "@prisma/client";
import {
  Building2,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Globe,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAdminProperties,
  createAdminProperty,
  updateAdminProperty,
  publishAdminProperty,
  deleteAdminProperty,
  type AdminPropertyItem,
} from "@/lib/actions/property";

const propertyFormSchema = z.object({
  title: z.string().min(3, "İlan başlığı en az 3 karakter olmalıdır."),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır."),
  price: z.number({ message: "Geçerli bir fiyat giriniz." }).positive("Fiyat sıfırdan büyük olmalıdır."),
  currency: z.enum(["EUR", "USD", "TRY", "GBP"]),
  status: z.nativeEnum(PropertyStatus),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  squareMeters: z.number({ message: "Geçerli metrekare giriniz." }).positive("Metrekare sıfırdan büyük olmalıdır."),
  isFurnished: z.boolean(),
  city: z.string().min(2, "Şehir zorunludur."),
  district: z.string().min(2, "İlçe/Semt zorunludur."),
  address: z.string().min(3, "Adres bilgisi zorunludur."),
  latitude: z.number().min(-90, "Enlem -90 ile 90 arasında olmalıdır.").max(90, "Enlem -90 ile 90 arasında olmalıdır.").nullable().optional(),
  longitude: z.number().min(-180, "Boylam -180 ile 180 arasında olmalıdır.").max(180, "Boylam -180 ile 180 arasında olmalıdır.").nullable().optional(),
  imageUrl: z.string().url("Geçerli bir görsel URL'si giriniz."),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
];

export default function PortfolioManagementPage() {
  const [properties, setProperties] = useState<AdminPropertyItem[]>([]);
  const [storageMode, setStorageMode] = useState<"prisma" | "memory">("memory");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PropertyStatus>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 12500000,
      currency: "EUR",
      status: PropertyStatus.FOR_SALE,
      bedrooms: 5,
      bathrooms: 6,
      squareMeters: 680,
      isFurnished: true,
      city: "Istanbul",
      district: "Bebek / Beşiktaş",
      address: "Cevdet Paşa Caddesi No: 42",
      latitude: null,
      longitude: null,
      imageUrl: PRESET_IMAGES[0],
    },
  });

  const currentImageUrl = watch("imageUrl");
  const currentStatus = watch("status");

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminProperties();
      setProperties(res.properties);
      setStorageMode(res.storageMode);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const openCreateModal = () => {
    setEditingId(null);
    reset({
      title: "",
      description: "",
      price: 12500000,
      currency: "EUR",
      status: PropertyStatus.FOR_SALE,
      bedrooms: 5,
      bathrooms: 6,
      squareMeters: 680,
      isFurnished: true,
      city: "Istanbul",
      district: "Bebek / Beşiktaş",
      address: "Cevdet Paşa Caddesi No: 42",
      latitude: null,
      longitude: null,
      imageUrl: PRESET_IMAGES[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prop: AdminPropertyItem) => {
    setEditingId(prop.id);
    reset({
      title: prop.title,
      description: prop.description,
      price: prop.price,
      currency: (["EUR", "USD", "TRY", "GBP"].includes(prop.currency)
        ? prop.currency
        : "EUR") as "EUR" | "USD" | "TRY" | "GBP",
      status: prop.status,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      squareMeters: prop.squareMeters,
      isFurnished: prop.isFurnished,
      city: prop.city,
      district: prop.district,
      address: prop.address,
      latitude: prop.latitude ?? null,
      longitude: prop.longitude ?? null,
      imageUrl: prop.imageUrl || PRESET_IMAGES[0],
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: PropertyFormValues) => {
    setToast(null);
    try {
      if (editingId) {
        const res = await updateAdminProperty(editingId, values);
        if (res.success) {
          setToast({
            type: "success",
            text: `✓ "${values.title}" başarıyla güncellendi (${
              res.storage === "prisma" ? "Prisma PostgreSQL" : "Lokal Önbellek"
            }).`,
          });
          setIsModalOpen(false);
          await fetchProperties();
        }
      } else {
        const res = await createAdminProperty(values);
        if (res.success) {
          setToast({
            type: "success",
            text: `✨ "${values.title}" portföye eklendi ve ${
              values.status === PropertyStatus.DRAFT
                ? "taslak olarak kaydedildi."
                : "ana sayfa vitrininde yayınlandı."
            }`,
          });
          setIsModalOpen(false);
          await fetchProperties();
        }
      }
    } catch {
      setToast({
        type: "error",
        text: "İlan kaydedilirken beklenmedik bir hata oluştu.",
      });
    }
  };

  const handlePublish = async (id: string, title: string) => {
    setPublishingId(id);
    setToast(null);
    try {
      const res = await publishAdminProperty(id, PropertyStatus.FOR_SALE);
      if (res.success) {
        setToast({
          type: "success",
          text: `"${title}" yayınlandı ve ana sayfa vitrini anında güncellendi.`,
        });
        await fetchProperties();
      }
    } catch {
      setToast({
        type: "error",
        text: "İlan yayınlanırken beklenmedik bir hata oluştu.",
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" ilanını kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }
    const res = await deleteAdminProperty(id);
    if (res.success) {
      setToast({
        type: "success",
        text: `"${title}" portföyden silindi.`,
      });
      await fetchProperties();
    }
  };

  const filtered = properties.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const formatPrice = (price: number, currency: string) => {
    const sym =
      currency === "USD" ? "$" : currency === "TRY" ? "₺" : currency === "GBP" ? "£" : "€";
    return `${sym} ${price.toLocaleString("tr-TR")}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              Prisma CRUD &amp; Envanter
            </span>
            <Badge variant="outline" className="text-[10px] border-gold-500/30 text-gold-400">
              <Database className="mr-1 h-3 w-3" />
              {storageMode === "prisma" ? "PostgreSQL Canlı" : "Senkronize Demo Modu"}
            </Badge>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Portföy Yönetimi</span>
            <Building2 className="h-6 w-6 text-gold-400" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Yeni lüks mülk ilanı ekleyin, mevcut kayıtları düzenleyin, durumunu güncelleyin veya portföyden kaldırın.
          </p>
        </div>

        <Button variant="gold" size="sm" onClick={openCreateModal} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Yeni İlan Ekle</span>
        </Button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`rounded-2xl p-4 text-xs flex items-center justify-between gap-3 ${
            toast.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-red-500/30 bg-red-500/10 text-red-400"
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
          <button onClick={() => setToast(null)} className="hover:underline">
            Kapat
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Başlık, şehir veya ilçe ile ara..."
            className="w-full rounded-xl border border-border bg-card/70 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { key: "ALL", label: "Tümü" },
              { key: PropertyStatus.FOR_SALE, label: "Satılık" },
              { key: PropertyStatus.OFF_MARKET, label: "Off-Market" },
              { key: PropertyStatus.FOR_RENT, label: "Kiralık" },
              { key: PropertyStatus.SOLD, label: "Satıldı" },
              { key: PropertyStatus.DRAFT, label: "Taslak" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.key
                  ? "bg-gold-500 text-black shadow-sm"
                  : "border border-border bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6 backdrop-blur-xl shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-xs text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
            <span>Portföy yükleniyor...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">
              Kriterlere uygun ilan bulunamadı
            </p>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              İlk İlanı Oluştur
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Mülk &amp; Lokasyon</th>
                  <th className="pb-3 font-semibold">Fiyat</th>
                  <th className="pb-3 font-semibold">Mimari</th>
                  <th className="pb-3 font-semibold">Durum</th>
                  <th className="pb-3 font-semibold">Danışman</th>
                  <th className="pb-3 text-right font-semibold">CRUD İşlemleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((prop) => (
                  <tr key={prop.id} className="group hover:bg-gold-500/5 transition-colors">
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 overflow-hidden rounded-lg border border-border shrink-0">
                          <Image
                            src={prop.imageUrl}
                            alt={prop.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                            {prop.title}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3 text-gold-500" />
                            <span>
                              {prop.district}, {prop.city}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-serif font-bold text-gold-500 whitespace-nowrap">
                      {formatPrice(prop.price, prop.currency)}
                    </td>

                    <td className="py-4 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5 text-gold-400" />
                          {prop.bedrooms}+1
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-gold-400" />
                          {prop.bathrooms}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5 text-gold-400" />
                          {prop.squareMeters} m²
                        </span>
                      </div>
                    </td>

                    <td className="py-4">
                      {prop.status === PropertyStatus.OFF_MARKET ? (
                        <Badge variant="navy" className="text-[10px]">
                          Off-Market
                        </Badge>
                      ) : prop.status === PropertyStatus.DRAFT ? (
                        <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                          Taslak
                        </Badge>
                      ) : prop.status === PropertyStatus.SOLD ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                          Satıldı
                        </Badge>
                      ) : (
                        <Badge variant="gold" className="text-[10px]">
                          {prop.status}
                        </Badge>
                      )}
                    </td>

                    <td className="py-4 text-muted-foreground">
                      {prop.agentName || "Derin Soydan"}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(prop.status === PropertyStatus.DRAFT ||
                          prop.status === PropertyStatus.OFF_MARKET) && (
                          <button
                            type="button"
                            onClick={() => handlePublish(prop.id, prop.title)}
                            disabled={publishingId === prop.id}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            title="İlanı Yayınla & Ana Sayfayı Güncelle"
                          >
                            {publishingId === prop.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Globe className="h-3.5 w-3.5" />
                            )}
                            <span>Yayınla</span>
                          </button>
                        )}
                        <Link
                          href={`/properties/${prop.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                          title="Vitrinde Görüntüle"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(prop)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold-500/40 transition-colors"
                          title="İlanı Düzenle"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prop.id, prop.title)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-red-400 hover:border-red-500/40 transition-colors"
                          title="İlanı Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-gold-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gold-400" />
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {editingId ? "İlanı Düzenle" : "Yeni Lüks İlan Ekle"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  İlan Başlığı
                </label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="Örn: Bebek Waterfront Historical Mansion"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                />
                {errors.title && (
                  <p className="text-red-400 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Mülk Açıklaması
                </label>
                <textarea
                  rows={3}
                  {...register("description")}
                  placeholder="Mülkün mimari özellikleri, manzara ve yatırım değeri..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none resize-none"
                />
                {errors.description && (
                  <p className="text-red-400 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Fiyat
                  </label>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                  {errors.price && (
                    <p className="text-red-400 mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Para Birimi
                  </label>
                  <select
                    {...register("currency")}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Yayın Durumu
                  </label>
                  <select
                    {...register("status")}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  >
                    <option value={PropertyStatus.FOR_SALE}>Satılık (FOR_SALE)</option>
                    <option value={PropertyStatus.OFF_MARKET}>Off-Market</option>
                    <option value={PropertyStatus.FOR_RENT}>Kiralık (FOR_RENT)</option>
                    <option value={PropertyStatus.SOLD}>Satıldı (SOLD)</option>
                    <option value={PropertyStatus.DRAFT}>Taslak (DRAFT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Yatak Odası
                  </label>
                  <input
                    type="number"
                    {...register("bedrooms", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Banyo
                  </label>
                  <input
                    type="number"
                    {...register("bathrooms", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Net Alan (m²)
                  </label>
                  <input
                    type="number"
                    {...register("squareMeters", { valueAsNumber: true })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    {...register("city")}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    İlçe / Bölge
                  </label>
                  <input
                    type="text"
                    {...register("district")}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Açık Adres
                  </label>
                  <input
                    type="text"
                    {...register("address")}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Enlem (Latitude — GEO Harita)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Örn: 41.1218"
                    {...register("latitude", {
                      setValueAs: (val: string) =>
                        val === "" || val === null || val === undefined
                          ? null
                          : Number(val),
                    })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                  {errors.latitude && (
                    <p className="text-red-400 mt-1">{errors.latitude.message}</p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Boylam (Longitude — GEO Harita)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Örn: 29.0712"
                    {...register("longitude", {
                      setValueAs: (val: string) =>
                        val === "" || val === null || val === undefined
                          ? null
                          : Number(val),
                    })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                  {errors.longitude && (
                    <p className="text-red-400 mt-1">{errors.longitude.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Vitrin Kapak Görseli (Cloudinary / URL)
                </label>
                <input
                  type="url"
                  {...register("imageUrl")}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                />
                {errors.imageUrl && (
                  <p className="text-red-400 mt-1">{errors.imageUrl.message}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  {PRESET_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setValue("imageUrl", img, { shouldValidate: true })}
                      className={`relative h-10 w-14 overflow-hidden rounded-lg border transition-all ${
                        currentImageUrl === img
                          ? "border-gold-500 ring-2 ring-gold-500/40"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Örnek ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  {...register("isFurnished")}
                  className="h-4 w-4 rounded border-border accent-gold-500"
                />
                <span>Eşyalı / Anahtar Teslim (Furnished)</span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Vazgeç
                </Button>
                <Button type="submit" variant="gold" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Kaydediliyor..."
                    : editingId
                    ? currentStatus === PropertyStatus.DRAFT
                      ? "Taslağı Güncelle"
                      : "Kaydet & Yayınla"
                    : currentStatus === PropertyStatus.DRAFT
                    ? "Taslak Olarak Kaydet"
                    : "İlanı Kaydet & Yayınla"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
