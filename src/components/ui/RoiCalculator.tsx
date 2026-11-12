"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Percent,
  Calendar,
  Wallet,
  TrendingUp,
  Clock,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export interface RoiCalculatorProps {
  initialPrice?: number;
  initialRent?: number;
  currency?: string;
  className?: string;
}

export function RoiCalculator({
  initialPrice = 42500000,
  initialRent = 120000,
  currency = "EUR",
  className = "",
}: RoiCalculatorProps) {
  // Input States
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30); // %30 varsayılan peşinat
  const [loanTermYears, setLoanTermYears] = useState<number>(15); // 15 yıl vade
  const [interestRate, setInterestRate] = useState<number>(4.2); // %4.2 yıllık faiz
  const [monthlyRent, setMonthlyRent] = useState<number>(initialRent);

  // Currency Formatter
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Real-time Amortization & ROI Calculations
  const calculations = useMemo(() => {
    const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = Math.max(0, propertyPrice - downPaymentAmount);

    const monthlyRate = interestRate > 0 ? interestRate / 100 / 12 : 0;
    const totalMonths = loanTermYears * 12;

    let monthlyMortgage = 0;
    if (loanAmount > 0 && totalMonths > 0) {
      if (monthlyRate > 0) {
        monthlyMortgage =
          (loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
      } else {
        monthlyMortgage = loanAmount / totalMonths;
      }
    }

    const annualRentIncome = monthlyRent * 12;
    const annualRoiPercent =
      propertyPrice > 0 ? (annualRentIncome / propertyPrice) * 100 : 0;
    const amortizationYears =
      annualRentIncome > 0 ? propertyPrice / annualRentIncome : 0;
    const netMonthlyCashFlow = monthlyRent - monthlyMortgage;

    return {
      downPaymentAmount,
      loanAmount,
      monthlyMortgage,
      annualRentIncome,
      annualRoiPercent,
      amortizationYears,
      netMonthlyCashFlow,
    };
  }, [propertyPrice, downPaymentPercent, loanTermYears, interestRate, monthlyRent]);

  const resetDefaults = () => {
    setPropertyPrice(initialPrice);
    setDownPaymentPercent(30);
    setLoanTermYears(15);
    setInterestRate(4.2);
    setMonthlyRent(initialRent);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-gold-500/30 bg-card/80 p-6 md:p-8 backdrop-blur-2xl shadow-luxury-glass ${className}`}
    >
      {/* Background Decorative Mesh */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-navy-600/15 blur-[100px]" />

      {/* Header */}
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400 mb-2">
            <Calculator className="h-3.5 w-3.5 text-gold-400" />
            <span>Yatırımcı Analiz Simülatörü</span>
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            ROI & Finansman Hesaplayıcı
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Mülkün kira projeksiyonu, kredi geri ödemesi ve net amortisman süresini dinamik olarak modelleyin.
          </p>
        </div>

        <button
          onClick={resetDefaults}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-gold-400 hover:border-gold-500/40 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Sıfırla</span>
        </button>
      </div>

      {/* Main Grid: Left Inputs, Right KPI Results */}
      <div className="relative mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Interactive Inputs (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Property Price Input */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label className="font-semibold text-muted-foreground uppercase tracking-wider">
                Mülk Satış Değeri
              </label>
              <span className="font-serif font-bold text-foreground">
                {formatMoney(propertyPrice)}
              </span>
            </div>
            <input
              type="range"
              min={1000000}
              max={100000000}
              step={500000}
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-border accent-gold-500 cursor-pointer"
            />
          </div>

          {/* 2. Down Payment (Peşinat) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-gold-400" />
                <span>Peşinat Oranı (%{downPaymentPercent})</span>
              </label>
              <span className="font-serif font-bold text-gold-400">
                {formatMoney(calculations.downPaymentAmount)}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-border accent-gold-500 cursor-pointer"
            />
            {/* Quick down payment presets */}
            <div className="mt-2.5 flex items-center gap-2">
              {[20, 30, 50, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                    downPaymentPercent === pct
                      ? "border-gold-500 bg-gold-500/15 text-gold-400"
                      : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pct === 100 ? "Nakit (%100)" : `%${pct}`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Loan Term & Interest Rate Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Loan Term */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gold-400" />
                  <span>Kredi Vadesi</span>
                </label>
                <span className="font-bold text-foreground">
                  {loanTermYears} Yıl ({loanTermYears * 12} Ay)
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-border accent-gold-500 cursor-pointer"
              />
              <div className="mt-2 flex items-center gap-1.5">
                {[10, 15, 20, 25].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setLoanTermYears(yr)}
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-medium border transition-colors ${
                      loanTermYears === yr
                        ? "border-gold-500 bg-gold-500/15 text-gold-400"
                        : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {yr} Yıl
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5 text-gold-400" />
                  <span>Yıllık Faiz Oranı</span>
                </label>
                <span className="font-bold text-foreground">
                  %{interestRate.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-border accent-gold-500 cursor-pointer"
              />
              <p className="mt-2 text-[10px] text-muted-foreground">
                Kullanılan Kredi: {formatMoney(calculations.loanAmount)}
              </p>
            </div>
          </div>

          {/* 4. Monthly Rent Expectation */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-gold-400" />
                <span>Tahmini Aylık Kira Geliri</span>
              </label>
              <span className="font-serif font-bold text-emerald-400">
                {formatMoney(monthlyRent)} / ay
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-border accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Calculated Results & KPIs (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Main KPI Card: Monthly Mortgage */}
          <div className="rounded-2xl border border-gold-500/40 bg-gradient-to-br from-gold-500/10 via-obsidian-950 to-navy-950 p-6 shadow-gold-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aylık Kredi Taksiti
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={calculations.monthlyMortgage}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="mt-2 font-serif text-3xl md:text-4xl font-extrabold text-gold-400 tracking-tight"
              >
                {formatMoney(calculations.monthlyMortgage)}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  / ay
                </span>
              </motion.div>
            </AnimatePresence>
            <p className="text-[11px] text-muted-foreground mt-1">
              {loanTermYears * 12} ay boyunca toplam faiz dahil planlama.
            </p>
          </div>

          {/* Two-column KPIs: ROI % & Amortization Years */}
          <div className="grid grid-cols-2 gap-4">
            {/* Yıllık ROI */}
            <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Yıllık ROI
                </span>
                <Sparkles className="h-4 w-4 text-gold-400" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={calculations.annualRoiPercent}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 font-serif text-2xl font-bold text-foreground"
                >
                  %{calculations.annualRoiPercent.toFixed(2)}
                </motion.div>
              </AnimatePresence>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Brüt Yıllık Getiri
              </p>
            </div>

            {/* Amortisman Süresi */}
            <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Geri Dönüş
                </span>
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={calculations.amortizationYears}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 font-serif text-2xl font-bold text-emerald-400"
                >
                  {calculations.amortizationYears.toFixed(1)} Yıl
                </motion.div>
              </AnimatePresence>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Amortisman Süresi
              </p>
            </div>
          </div>

          {/* Net Cash Flow Banner */}
          <div className="rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Net Aylık Nakit Akışı
              </p>
              <p className="text-[10px] text-muted-foreground">
                (Kira Geliri - Kredi Taksiti)
              </p>
            </div>
            <div
              className={`font-serif text-lg font-bold ${
                calculations.netMonthlyCashFlow >= 0
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {calculations.netMonthlyCashFlow >= 0 ? "+" : ""}
              {formatMoney(calculations.netMonthlyCashFlow)}
            </div>
          </div>

          {/* Legal / Institutional Advisory Note */}
          <div className="flex items-start gap-2 pt-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold-400 shrink-0 mt-0.5" />
            <span>
              Vergi muafiyetleri ve özel bankacılık finansman oranları için özel B2B danışmanımızla görüşebilirsiniz.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
