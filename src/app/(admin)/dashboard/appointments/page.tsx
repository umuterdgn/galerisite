"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  Phone,
  ArrowLeft,
  Filter,
  Plane,
  Video,
  ChevronLeft,
  ChevronRight,
  Send,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAllAppointments,
  updateAppointmentStatus,
  type AppointmentRecord,
} from "@/lib/actions/appointment";
import { type DispatchReceipt } from "@/lib/services/notifications";
import { AppointmentStatus } from "@prisma/client";

export default function AppointmentsCalendarDashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | AppointmentStatus>("ALL");
  const [viewMode, setViewMode] = useState<"CALENDAR" | "LIST">("CALENDAR");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null);

  // Notification Receipt State
  const [latestReceipt, setLatestReceipt] = useState<DispatchReceipt | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Month navigation
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 10, 1)); // November 2026

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.warn("Failed to fetch appointments:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Handle Status Update (Confirm / Cancel)
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setIsLoading(true);
    try {
      const res = await updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );

        if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
        }

        if (res.receipt) {
          setLatestReceipt(res.receipt);
        }

        const actionText = newStatus === AppointmentStatus.CONFIRMED ? "ONAYLANDI" : "REDDEDİLDİ";
        setToastMessage(`✓ Randevu ${actionText}! Müşteriye ve sorumlu brokera anında SMS ve E-posta iletildi.`);
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (filterStatus === "ALL") return true;
    return a.status === filterStatus;
  });

  // Calendar Days generator (November 2026 - 30 days)
  const daysInMonth = 30;
  const calendarCells = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNumber = i + 1;
    const dateStr = `2026-11-${String(dayNumber).padStart(2, "0")}`;
    const dayAppointments = appointments.filter((a) => a.date === dateStr);
    return { dayNumber, dateStr, dayAppointments };
  });

  const monthName = currentMonthDate.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  // Stats
  const countPending = appointments.filter((a) => a.status === AppointmentStatus.PENDING).length;
  const countConfirmed = appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length;
  const countCompleted = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;

  return (
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:border-gold-500/40 hover:text-gold-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
                  Akıllı Rezervasyon &amp; Gösterim
                </span>
                <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
                <Badge variant="gold" className="text-[10px]">
                  Google Calendar &amp; SMS Sync
                </Badge>
              </div>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <span>VIP Randevu &amp; Özel Gösterim Takvimi</span>
                <CalendarIcon className="h-6 w-6 text-gold-400" />
              </h1>
            </div>
          </div>

          {/* View Mode & Actions */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center rounded-xl border border-border bg-card/80 p-1">
              <button
                type="button"
                onClick={() => setViewMode("CALENDAR")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "CALENDAR"
                    ? "bg-gold-500 text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                📅 Takvim Görünümü
              </button>
              <button
                type="button"
                onClick={() => setViewMode("LIST")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  viewMode === "LIST"
                    ? "bg-gold-500 text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                📋 Talep Listesi
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadAppointments}
              className="h-9 px-3 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-gold-400" : ""}`} />
              <span className="hidden sm:inline">Yenile</span>
            </Button>
          </div>
        </div>

        {/* Live Notification Toast & Dispatch Receipt */}
        {toastMessage && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-center justify-between gap-3 shadow-lg backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs hover:underline text-muted-foreground"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Live SMS & E-posta Dispatch Receipt Box */}
        {latestReceipt && (
          <div className="rounded-2xl border border-gold-500/30 bg-card/80 p-4 sm:p-5 backdrop-blur-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <span className="text-xs font-bold text-gold-400 flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                <span>Son Gönderilen SMS &amp; E-Posta Bildirim Kanıtı (Canlı Servis Çıktısı)</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Zaman: {new Date(latestReceipt.timestamp).toLocaleTimeString("tr-TR")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1 text-[11px]">
                  <Phone className="h-3 w-3 text-emerald-400" />
                  <span>Müşteri SMS İletisi:</span>
                </span>
                <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                  {latestReceipt.notifications.guestSms}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-3">
                <span className="font-semibold text-foreground flex items-center gap-1.5 mb-1 text-[11px]">
                  <Mail className="h-3 w-3 text-sky-400" />
                  <span>Danışman SMS &amp; Takvim (.ics) Entegrasyonu:</span>
                </span>
                <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                  {latestReceipt.notifications.agentSms}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
            <span className="text-xs text-muted-foreground font-medium">Toplam Randevu</span>
            <p className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              {appointments.length}
            </p>
            <span className="text-[11px] text-muted-foreground">Aktif Portföy Talepleri</span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-medium">Bekleyen Talepler (PENDING)</span>
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <p className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold text-amber-400">
              {countPending}
            </p>
            <span className="text-[11px] text-muted-foreground">Onay bekleyen VIP misafirler</span>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 backdrop-blur-xl">
            <span className="text-xs text-emerald-300 font-medium">Onaylananlar (CONFIRMED)</span>
            <p className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {countConfirmed}
            </p>
            <span className="text-[11px] text-muted-foreground">SMS &amp; Takvim daveti gönderildi</span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
            <span className="text-xs text-muted-foreground font-medium">Tamamlanan Gösterimler</span>
            <p className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              {countCompleted}
            </p>
            <span className="text-[11px] text-muted-foreground">Teklif &amp; Müzakere aşamasında</span>
          </div>
        </div>

        {/* Status Filter Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground mr-1">Durum Filtresi:</span>

            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                filterStatus === "ALL"
                  ? "bg-gold-500 text-black shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Tümü ({appointments.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus(AppointmentStatus.PENDING)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                filterStatus === AppointmentStatus.PENDING
                  ? "bg-amber-400 text-black shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Bekleyenler ({countPending})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus(AppointmentStatus.CONFIRMED)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                filterStatus === AppointmentStatus.CONFIRMED
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Onaylananlar ({countConfirmed})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus(AppointmentStatus.CANCELLED)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                filterStatus === AppointmentStatus.CANCELLED
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              İptaller
            </button>
          </div>

          <span className="text-xs text-muted-foreground font-mono">
            {filteredAppointments.length} randevu listeleniyor
          </span>
        </div>

        {/* =========================================================================
            VIEW 1: FULLCALENDAR-STYLE INTERACTIVE MONTHLY GRID
            ========================================================================= */}
        {viewMode === "CALENDAR" && (
          <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-4">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground capitalize">
                {monthName}
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentMonthDate(new Date(2026, 9, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold-500/40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold font-mono px-2 text-gold-400">Kasım 2026</span>
                <button
                  type="button"
                  onClick={() => setCurrentMonthDate(new Date(2026, 11, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold-500/40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2">
              <span>Pzt</span>
              <span>Sal</span>
              <span>Çar</span>
              <span>Per</span>
              <span>Cum</span>
              <span className="text-gold-400">Cmt</span>
              <span className="text-gold-400">Paz</span>
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell) => {
                const hasAppointments = cell.dayAppointments.length > 0;

                return (
                  <div
                    key={cell.dayNumber}
                    className={`min-h-[105px] rounded-2xl border p-2 flex flex-col justify-between transition-all ${
                      hasAppointments
                        ? "border-gold-500/40 bg-gold-500/5 hover:border-gold-500 hover:shadow-gold-sm"
                        : "border-border/60 bg-background/40 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-muted-foreground">
                        {cell.dayNumber}
                      </span>
                      {hasAppointments && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-500/20 text-[9px] font-bold text-gold-400">
                          {cell.dayAppointments.length}
                        </span>
                      )}
                    </div>

                    {/* Appointment Chips in Cell */}
                    <div className="space-y-1 mt-1">
                      {cell.dayAppointments.slice(0, 2).map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedAppointment(app)}
                          className={`w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-left transition-all ${
                            app.status === AppointmentStatus.PENDING
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30"
                              : app.status === AppointmentStatus.CONFIRMED
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                          }`}
                        >
                          <span className="font-mono">{app.timeSlot}</span> {app.guestName}
                        </button>
                      ))}
                      {cell.dayAppointments.length > 2 && (
                        <span className="text-[9px] text-muted-foreground block text-center">
                          +{cell.dayAppointments.length - 2} daha
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: LIST VIEW OF APPOINTMENTS (Talep Masası)
            ========================================================================= */}
        {viewMode === "LIST" && (
          <div className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Misafir &amp; İletişim</th>
                    <th className="pb-3 font-semibold">İlgilenilen Mülk</th>
                    <th className="pb-3 font-semibold">Tarih &amp; Saat</th>
                    <th className="pb-3 font-semibold">Tur Türü</th>
                    <th className="pb-3 font-semibold">Durum</th>
                    <th className="pb-3 text-right font-semibold">Tek Tuşla İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredAppointments.map((app) => (
                    <tr key={app.id} className="group hover:bg-gold-500/5 transition-colors">
                      <td className="py-4 pr-3">
                        <p className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                          {app.guestName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <span>{app.guestPhone}</span>
                          <span>·</span>
                          <span className="truncate max-w-[150px]">{app.guestEmail}</span>
                        </div>
                      </td>

                      <td className="py-4 font-medium text-foreground">
                        <span className="line-clamp-1">{app.propertyTitle}</span>
                        <span className="text-[11px] text-gold-400 font-mono">
                          {app.propertyPrice}
                        </span>
                      </td>

                      <td className="py-4 font-mono">
                        <span className="font-semibold text-foreground block">{app.date}</span>
                        <span className="text-gold-400">{app.timeSlot}</span>
                      </td>

                      <td className="py-4">
                        {app.tourType === "PHYSICAL" ? (
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Building className="h-3.5 w-3.5 text-gold-400" />
                            <span>Yerinde Tur</span>
                            {app.vipTransfer === "HELICOPTER" && (
                              <span title="Helikopter Transferi">
                                <Plane className="h-3 w-3 text-gold-400" />
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sky-400 font-medium">
                            <Video className="h-3.5 w-3.5" />
                            <span>Online Video</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4">
                        {app.status === AppointmentStatus.PENDING && (
                          <Badge variant="outline" className="text-amber-400 border-amber-400/40 text-[10px]">
                            ● Beklemede (PENDING)
                          </Badge>
                        )}
                        {app.status === AppointmentStatus.CONFIRMED && (
                          <Badge variant="outline" className="text-emerald-400 border-emerald-400/40 text-[10px]">
                            ✓ Onaylandı (CONFIRMED)
                          </Badge>
                        )}
                        {app.status === AppointmentStatus.CANCELLED && (
                          <Badge variant="outline" className="text-red-400 border-red-400/40 text-[10px]">
                            ✕ İptal (CANCELLED)
                          </Badge>
                        )}
                        {app.status === AppointmentStatus.COMPLETED && (
                          <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                            Tamamlandı
                          </Badge>
                        )}
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAppointment(app)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                            title="Detay Görüntüle"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {app.status === AppointmentStatus.PENDING && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, AppointmentStatus.CONFIRMED)}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                title="SMS ve E-posta ile Onayla"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Onayla</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, AppointmentStatus.CANCELLED)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500/20 transition-all"
                                title="Reddet"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reddet</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            DRAWER / MODAL: APPOINTMENT DETAILS & ONE-CLICK CONFIRMATION
            ========================================================================= */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-3xl border border-gold-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400 font-bold">
                    VIP
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      Randevu &amp; Özel Gösterim Detayı
                    </h3>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      ID: #{selectedAppointment.id}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`rounded-2xl p-4 flex items-center justify-between border ${
                  selectedAppointment.status === AppointmentStatus.PENDING
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : selectedAppointment.status === AppointmentStatus.CONFIRMED
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/40 bg-red-500/10 text-red-300"
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    Güncel Randevu Durumu
                  </span>
                  <span className="text-sm font-bold font-mono">
                    {selectedAppointment.status}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {selectedAppointment.tourType === "PHYSICAL" ? "Yerinde VIP Tur" : "Online Video Tur"}
                </Badge>
              </div>

              {/* Guest & Property Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 rounded-xl border border-border bg-background/50 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Misafir Bilgileri
                  </span>
                  <p className="font-serif text-sm font-bold text-foreground">
                    {selectedAppointment.guestName}
                  </p>
                  <p className="text-muted-foreground">{selectedAppointment.guestPhone}</p>
                  <p className="text-muted-foreground truncate">{selectedAppointment.guestEmail}</p>
                </div>

                <div className="space-y-1 rounded-xl border border-border bg-background/50 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tarih &amp; Zaman
                  </span>
                  <p className="font-serif text-sm font-bold text-gold-400">
                    {selectedAppointment.date}
                  </p>
                  <p className="font-mono text-foreground font-semibold">
                    Saat: {selectedAppointment.timeSlot}
                  </p>
                  <p className="text-muted-foreground">
                    Sorumlu: {selectedAppointment.agentName || "Derin Soydan"}
                  </p>
                </div>
              </div>

              {/* Property Details */}
              <div className="rounded-xl border border-border bg-background/50 p-3.5 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Gösterimi Yapılacak Mülk
                </span>
                <p className="font-serif text-sm font-bold text-foreground">
                  {selectedAppointment.propertyTitle}
                </p>
                {selectedAppointment.propertyPrice && (
                  <p className="font-serif text-xs font-bold text-gold-400">
                    {selectedAppointment.propertyPrice}
                  </p>
                )}
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div className="rounded-xl border border-border bg-background/50 p-3 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                    Misafir Notu &amp; VIP Transfer:
                  </span>
                  <p className="text-muted-foreground italic">&quot;{selectedAppointment.notes}&quot;</p>
                </div>
              )}

              {/* Action Buttons: Confirm / Cancel */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Kapat
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, AppointmentStatus.CANCELLED)}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Talebi Reddet</span>
                  </Button>

                  <Button
                    variant="gold"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, AppointmentStatus.CONFIRMED)}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Tek Tuşla Onayla &amp; SMS/E-posta Gönder</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
