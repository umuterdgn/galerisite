"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building,
  Trash2,
  Edit3,
  Mail,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  Gem,
  Eye,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAgencyTeam,
  addTeamMember,
  deleteTeamMember,
  updateTeamMember,
  getScopedProperties,
  type TeamMemberItem,
} from "@/lib/actions/team";
import { Role } from "@prisma/client";

export default function AgencyTeamManagementPage() {
  const { data: session } = useSession();

  // Active Role Simulation (Session veya demo test için hızlı değiştirici)
  const [activeRole, setActiveRole] = useState<Role>("AGENCY_OWNER");
  const [activeUserId, setActiveUserId] = useState<string>("user-owner-01");

  const [team, setTeam] = useState<TeamMemberItem[]>([]);
  const [scopedProperties, setScopedProperties] = useState<
    {
      id: string;
      title: string;
      price: string;
      city: string;
      district: string;
      agentId: string;
      agentName: string;
      agencyId: string;
      status: string;
    }[]
  >([]);
  const [scopeDescription, setScopeDescription] = useState<string>("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);

  // Add Form Inputs
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("Lumiere2026!");
  const [newSpecialty, setNewSpecialty] = useState("Sarıyer Boğaz Hattı & Yalılar");
  const [newRole, setNewRole] = useState<Role>(Role.AGENT);

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const sessionRole = session?.user?.role;
  const sessionUserId = session?.user?.id;

  // Sync role from real NextAuth session if available
  useEffect(() => {
    if (sessionRole) {
      setActiveRole((prev) => (prev === sessionRole ? prev : sessionRole));
      const nextUserId = sessionUserId || "user-owner-01";
      setActiveUserId((prev) => (prev === nextUserId ? prev : nextUserId));
    }
  }, [sessionRole, sessionUserId]);

  // Load team data
  const loadData = useCallback(async () => {
    const list = await getAgencyTeam("agency-prime-01");
    setTeam(list);

    const scoped = await getScopedProperties({
      id: activeUserId,
      role: activeRole,
      agencyId: "agency-prime-01",
    });
    setScopedProperties(scoped.properties);
    setScopeDescription(scoped.description);
  }, [activeRole, activeUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Role Switch Simulation
  const handleSwitchSimulatedRole = (role: Role, userId: string) => {
    setActiveRole(role);
    setActiveUserId(userId);
    setNotification({
      type: "info",
      text:
        role === "AGENCY_OWNER"
          ? "👑 Ajans Sahibi (AGENCY_OWNER) moduna geçildi. Tüm ajansın ilanlarını ve personel kadrosunu görebilirsiniz."
          : "💼 Emlak Danışmanı (AGENT - Can Demir) moduna geçildi. RBAC gereği sadece kendi girdiğiniz ilanları görebilirsiniz.",
    });
  };

  // Add New Team Member
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const res = await addTeamMember({
      fullName: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      agencyId: "agency-prime-01",
      specialty: newSpecialty,
    });

    if (res.success) {
      setNotification({
        type: "success",
        text: `✨ ${newName} ekibe başarıyla eklendi! Geçici şifresi: ${newPassword}`,
      });
      setIsAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      loadData();
    } else {
      setNotification({ type: "error", text: res.error || "Personel eklenemedi." });
    }
  };

  // Delete Team Member
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} adlı personeli ekipten silmek istediğinize emin misiniz?`)) {
      return;
    }
    const res = await deleteTeamMember(id);
    if (res.success) {
      setNotification({
        type: "success",
        text: `${name} ekipten başarıyla silindi.`,
      });
      loadData();
    }
  };

  // Update Team Member
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const res = await updateTeamMember({
      id: editingMember.id,
      fullName: editingMember.fullName,
      specialty: editingMember.specialty,
      status: editingMember.status,
    });

    if (res.success) {
      setNotification({
        type: "success",
        text: `${editingMember.fullName} bilgileri güncellendi.`,
      });
      setEditingMember(null);
      loadData();
    }
  };

  const isOwner = activeRole === "AGENCY_OWNER" || activeRole === "SUPERADMIN";

  return (
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Breadcrumb & Tenant Bar */}
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
                <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-gold-500/40 bg-gold-500/10 text-gold-400">
                  <Gem className="h-3 w-3" />
                </div>
                <span className="font-serif text-sm font-bold tracking-wider text-foreground">
                  LUMIÈRE PRIME ESTATES
                </span>
                <span className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider">
                  Tenant #agency-prime-01
                </span>
              </div>
              <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <span>Emlak Ajansı &amp; Ekip Yönetim Konsolu</span>
                <ShieldCheck className="h-6 w-6 text-gold-400" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Logged in User Badge */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500/20 text-gold-400 font-bold text-xs border border-gold-500/30">
                {activeRole === "AGENCY_OWNER" ? "DS" : "CD"}
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground text-xs leading-none">
                  {activeRole === "AGENCY_OWNER" ? "Derin Soydan" : "Can Demir"}
                </p>
                <p className="text-[10px] text-gold-400 font-mono mt-0.5">{activeRole}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="gap-1.5 text-xs text-muted-foreground hover:text-red-400 hover:border-red-500/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div
            className={`rounded-2xl p-4 text-xs flex items-center justify-between gap-3 shadow-lg ${
              notification.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : notification.type === "error"
                ? "border border-red-500/30 bg-red-500/10 text-red-400"
                : "border border-gold-500/30 bg-gold-500/10 text-gold-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs hover:underline text-muted-foreground"
            >
              Kapat
            </button>
          </div>
        )}

        {/* RBAC Simulation Quick Toggle Bar */}
        <div className="rounded-2xl border border-gold-500/30 bg-card/60 p-4 sm:p-5 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Rol Tabanlı Erişim Kontrolü (RBAC) Test Simülatörü</span>
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sistemin farklı roller altında yetkilendirme davranışını anında test edin:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSwitchSimulatedRole("AGENCY_OWNER", "user-owner-01")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  activeRole === "AGENCY_OWNER"
                    ? "border border-gold-500 bg-gold-gradient text-black shadow-gold-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>👑 AGENCY_OWNER (Ajans Sahibi)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchSimulatedRole("AGENT", "user-agent-01")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  activeRole === "AGENT"
                    ? "border border-gold-500 bg-gold-gradient text-black shadow-gold-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>💼 AGENT (Broker: Can Demir)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
            <span className="text-xs text-muted-foreground font-medium">Toplam Broker Kadrosu</span>
            <p className="mt-2 font-serif text-3xl font-extrabold text-foreground">
              {team.length}
            </p>
            <span className="text-[11px] text-gold-400 font-medium">Aktif Lisanslı</span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
            <span className="text-xs text-muted-foreground font-medium">Aktif Portföy Hacmi</span>
            <p className="mt-2 font-serif text-3xl font-extrabold text-gold-500">
              € 189.4M
            </p>
            <span className="text-[11px] text-emerald-400 font-medium">5 Ayrıcalıklı Mülk</span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
            <span className="text-xs text-muted-foreground font-medium">Bu Ayki VIP Randevular</span>
            <p className="mt-2 font-serif text-3xl font-extrabold text-foreground">
              24
            </p>
            <span className="text-[11px] text-gold-400 font-medium">8 Onaylanmış Helikopter Transferi</span>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl">
            <span className="text-xs text-muted-foreground font-medium">Ajans SaaS Durumu</span>
            <p className="mt-2 font-serif text-2xl font-extrabold text-emerald-400">
              Aktif &amp; Lisanslı
            </p>
            <span className="text-[11px] text-muted-foreground">Tenant: Prime Bodrum</span>
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: Team Members Management (AGENCY_OWNER Only)
            ========================================================================= */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold-400" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  Ajans Broker &amp; Personel Kadrosu
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Emlak danışmanlarınızı (AGENT) ekleyin, yetkilendirin ve portföy kotalarını belirleyin.
              </p>
            </div>

            {isOwner ? (
              <Button
                variant="gold"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2 self-start sm:self-auto"
              >
                <UserPlus className="h-4 w-4" />
                <span>Yeni Broker / Personel Ekle</span>
              </Button>
            ) : (
              <Badge variant="navy" className="text-xs py-1 px-3">
                <Lock className="mr-1.5 h-3.5 w-3.5 text-gold-400" />
                <span>Personel Yönetimi (Yalnızca Ajans Sahibi)</span>
              </Badge>
            )}
          </div>

          {/* Table: Team Members */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Personel</th>
                  <th className="pb-3 font-semibold">Rol</th>
                  <th className="pb-3 font-semibold">Uzmanlık Alanı</th>
                  <th className="pb-3 font-semibold">Aktif İlanlar</th>
                  <th className="pb-3 font-semibold">Kapanan VIP Talep</th>
                  <th className="pb-3 font-semibold">Durum</th>
                  {isOwner && <th className="pb-3 text-right font-semibold">İşlemler</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {team.map((member) => (
                  <tr key={member.id} className="group hover:bg-gold-500/5 transition-colors">
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 font-bold text-gold-400 text-xs">
                          {member.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                            {member.fullName}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      {member.role === "AGENCY_OWNER" ? (
                        <Badge variant="gold" className="text-[10px]">
                          👑 AGENCY_OWNER
                        </Badge>
                      ) : member.role === "SUPERADMIN" ? (
                        <Badge variant="navy" className="text-[10px]">
                          ⚡ SUPERADMIN
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-gold-400 border-gold-500/30">
                          💼 AGENT
                        </Badge>
                      )}
                    </td>

                    <td className="py-4 text-muted-foreground font-medium">
                      {member.specialty}
                    </td>

                    <td className="py-4 font-mono font-bold text-foreground">
                      {member.activeListingsCount} İlan
                    </td>

                    <td className="py-4 font-mono text-gold-400 font-semibold">
                      {member.closedDealsCount} VIP Randevu
                    </td>

                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{member.status}</span>
                      </span>
                    </td>

                    {isOwner && (
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingMember(member)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold-500/40 transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {member.role !== "AGENCY_OWNER" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(member.id, member.fullName)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-red-400 hover:border-red-500/40 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: RBAC Scoped Property Visibility (İlan Yetki İspatı)
            ========================================================================= */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gold-400" />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  Rol Tabanlı İlan Kapsamı (RBAC Scoped Visibility)
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Kullanıcının rolüne göre veritabanından filtrelenen ilanlar:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs border-gold-500/30 text-gold-400 py-1 px-3"
              >
                <span>Aktif Yetki Kapsamı: <strong>{scopeDescription}</strong></span>
              </Badge>
            </div>
          </div>

          {/* Scoped Properties Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-semibold">İlan &amp; Konum</th>
                  <th className="pb-3 font-semibold">Fiyat</th>
                  <th className="pb-3 font-semibold">Sorumlu Broker (Agent)</th>
                  <th className="pb-3 font-semibold">Erişim Durumu</th>
                  <th className="pb-3 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {scopedProperties.map((prop) => (
                  <tr key={prop.id} className="group hover:bg-gold-500/5 transition-colors">
                    <td className="py-3.5 pr-3">
                      <p className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                        {prop.title}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {prop.district}, {prop.city}
                      </span>
                    </td>

                    <td className="py-3.5 font-serif font-bold text-gold-500">
                      {prop.price}
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {prop.agentName}
                        </span>
                        {prop.agentId === activeUserId && (
                          <Badge variant="gold" className="text-[9px]">
                            Sizin İlanınız
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {activeRole === "AGENCY_OWNER"
                          ? "✓ Ajans Sahibi Tam Erişim (Gör & Yönet)"
                          : "✓ Danışman Erişim (Kendi Portföyü)"}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <Link
                        href={`/properties/${prop.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RBAC Technical Clarification Note */}
          <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 p-4 text-xs leading-relaxed text-muted-foreground flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-gold-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gold-400 block mb-0.5">
                Multi-Tenant Veri İzolasyon Güvencesi:
              </strong>
              <span>
                Prisma sorgusu arka planda <code>where: &#123; agencyId: session.user.agencyId, ...(isAgent ? &#123; agentId: session.user.id &#125; : &#123;&#125;) &#125;</code> koşulu ile çalışır. Bir emlak danışmanı asla diğer brokerların veya rakip ajansların gizli müşteri verilerine ve off-market portföyüne erişemez.
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MODAL: Add New Team Member
            ========================================================================= */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl border border-gold-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-gold-400" />
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Yeni Emlak Danışmanı / Broker Ekle
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Örn: Sinan Çelik"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Kurumsal E-Posta
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sinan.celik@lumiere.luxury"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Geçici Giriş Şifresi
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-gold-400 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Rol
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as Role)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                    >
                      <option value="AGENT">AGENT (Emlakçı)</option>
                      <option value="AGENCY_OWNER">AGENCY_OWNER (Ortak)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Uzmanlık Bölgesi
                    </label>
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Bodrum / Yalıkavak"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" variant="gold">
                    Personeli Kaydet &amp; Yetkilendir
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: Edit Team Member
            ========================================================================= */}
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl border border-gold-500/40 bg-card p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-gold-400" />
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Personel Bilgilerini Düzenle
                  </h3>
                </div>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.fullName}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, fullName: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Uzmanlık Alanı
                  </label>
                  <input
                    type="text"
                    value={editingMember.specialty || ""}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, specialty: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Çalışma Durumu
                  </label>
                  <select
                    value={editingMember.status}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        status: e.target.value as "ACTIVE" | "ON_LEAVE" | "INACTIVE",
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Aktif Görevde)</option>
                    <option value="ON_LEAVE">ON_LEAVE (İzinde)</option>
                    <option value="INACTIVE">INACTIVE (Pasif)</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingMember(null)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" variant="gold">
                    Değişiklikleri Kaydet
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}

