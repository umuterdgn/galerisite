"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Sparkles,
  X,
  Mic,
  MicOff,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PropertyCard, type PropertyCardItem } from "@/components/public/PropertyCard";

export interface SemanticSearchResultItem extends PropertyCardItem {
  similarity?: number;
  matchPercent?: number;
  aiReason?: string;
}

export interface SemanticSearchProps {
  initialQuery?: string;
  initialProperties?: PropertyCardItem[];
  onResultsChange?: (results: SemanticSearchResultItem[]) => void;
  className?: string;
}

// Recommended Natural Language Search Queries
const SAMPLE_NATURAL_QUERIES = [
  "Hastaneye yakın, büyük balkonlu ve deniz manzaralı 3+1 evler",
  "Boğaz kıyısında özel yat iskelesi ve helikopter pistli tarihi yalı",
  "Bodrum'da gün batımı manzaralı ve sonsuzluk havuzlu taş villa",
  "Dubai Palm Jumeirah'ta çatı havuzlu lüks penthouse",
  "Fransız Rivierası'nda zeytin ağaçlarıyla çevrili sahil malikânesi",
];

const EMPTY_PROPERTIES: PropertyCardItem[] = [];

export function SemanticSearch({
  initialQuery = "",
  initialProperties = EMPTY_PROPERTIES,
  className = "",
}: SemanticSearchProps) {
  const initialPropsRef = useRef(initialProperties);
  initialPropsRef.current = initialProperties;
  const initialPropsSignature = initialProperties
    .map((p) => `${p.id}:${p.status}:${p.hasPanorama360}`)
    .join("|");

  const [query, setQuery] = useState(initialQuery);
  const [activeSearchedQuery, setActiveSearchedQuery] = useState(initialQuery);
  const [results, setResults] = useState<SemanticSearchResultItem[]>(
    initialProperties.map((p) => ({ ...p }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchEngine, setSearchEngine] = useState<string>(
    initialProperties.length > 0 ? "Prisma PostgreSQL (Canlı)" : "pgvector (1536-dim)"
  );
  const [isListening, setIsListening] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Execute Semantic Search API Request
  const executeSearch = useCallback(
    async (searchQuery: string) => {
      const hasInitialProps = initialPropsSignature.length > 0;
      if (!searchQuery.trim() && hasInitialProps) {
        setActiveSearchedQuery("");
        setResults(initialPropsRef.current.map((p) => ({ ...p })));
        setSearchEngine("Prisma PostgreSQL (Canlı)");
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setActiveSearchedQuery(searchQuery);

      try {
        const res = await fetch("/api/search/semantic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.results) {
            setResults(data.results);
            if (data.engine) setSearchEngine(data.engine);
          }
        }
      } catch (err) {
        console.warn("Semantic search fetch error:", err);
      } finally {
        setIsLoading(false);
        setHasSearched(Boolean(searchQuery.trim()));
      }
    },
    [initialPropsSignature]
  );

  // Initial load: use SSR Prisma initialProperties directly unless a query is active
  useEffect(() => {
    if (!initialQuery.trim() && initialPropsSignature.length > 0) {
      setResults(initialPropsRef.current.map((p) => ({ ...p })));
      setSearchEngine("Prisma PostgreSQL (Canlı)");
      setHasSearched(false);
      return;
    }
    executeSearch(initialQuery);
  }, [executeSearch, initialQuery, initialPropsSignature]);

  // Handle Search Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeSearch(query);
  };

  // Sample Query Click
  const handleSelectSample = (sample: string) => {
    setQuery(sample);
    executeSearch(sample);
  };

  // Clear Search
  const handleClear = () => {
    setQuery("");
    executeSearch("");
    setHasSearched(false);
  };

  // Simulated Voice Search
  const toggleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Check browser SpeechRecognition support
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
    };

    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "tr-TR";
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        executeSearch(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Fallback voice simulation
      setIsListening(true);
      setTimeout(() => {
        const spoken = "Hastaneye yakın, büyük balkonlu ve deniz manzaralı 3+1 evler";
        setQuery(spoken);
        executeSearch(spoken);
        setIsListening(false);
      }, 1500);
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* =========================================================================
          Large & Luxurious AI Search Bar
          ========================================================================= */}
      <div className="relative mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="relative group">
          {/* Ambient Golden Glow Behind Search Bar */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-gold-500/30 via-gold-400/20 to-purple-500/20 opacity-70 blur-xl transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />

          {/* Search Bar Input Container */}
          <div className="relative flex items-center rounded-2xl sm:rounded-3xl border border-gold-500/40 bg-card/85 p-2 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all group-focus-within:border-gold-500 group-focus-within:ring-2 group-focus-within:ring-gold-500/20">
            {/* AI Sparkles Icon */}
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Örn: Hastaneye yakın, büyük balkonlu ve deniz manzaralı 3+1 evler..."
              className="flex-1 bg-transparent px-3 sm:px-4 text-sm sm:text-base font-medium text-foreground placeholder-muted-foreground outline-none tracking-wide"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground transition-colors mr-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Voice Search Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? "Dinleniyor..." : "Sesli Arama"}
              className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all mr-2 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-muted-foreground hover:bg-gold-500/10 hover:text-gold-400"
              }`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>

            {/* Search Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-gold-500 bg-gold-gradient px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Semantik Ara</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Natural Language Prompt Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Bot className="h-3.5 w-3.5 text-gold-400" />
            <span>Örnek Doğal Sorgular:</span>
          </span>
          {SAMPLE_NATURAL_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="group/pill inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-gold-500/40 hover:text-foreground hover:bg-card/90"
            >
              <Sparkles className="h-2.5 w-2.5 text-gold-500/70 group-hover/pill:text-gold-400" />
              <span>{sample}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          Search Results Header & Vector Engine Metadata
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              {hasSearched ? "Semantik Vektör Eşleşmeleri" : "Tüm Portföy Kataloğu"}
            </span>
            <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
            <Badge variant="gold" className="text-[10px]">
              {results.length} Seçkin Mülk
            </Badge>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-1">
            {activeSearchedQuery ? (
              <span>
                &quot;<strong className="text-gold-400">{activeSearchedQuery}</strong>&quot; için Önerilen İlanlar
              </span>
            ) : (
              "Lüks Portföy Koleksiyonu"
            )}
          </h3>
        </div>

        {/* AI Vector Engine Indicator */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-gold-500/30 bg-card text-[11px] font-medium text-gold-400 py-1 px-3 shadow-sm"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-gold-400" />
            <span>{searchEngine}</span>
          </Badge>
        </div>
      </div>

      {/* =========================================================================
          Results Grid with AI Match Score Badges & Reasoning
          ========================================================================= */}
      {results.length === 0 && !isLoading ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h4 className="mt-4 font-serif text-lg font-bold text-foreground">
            Eşleşen lüks ilan bulunamadı
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Lütfen arama cümlenizi farklı kelimelerle deneyin veya filtreyi sıfırlayın.
          </p>
          <button
            onClick={handleClear}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold-500 bg-gold-gradient px-4 py-2 text-xs font-bold text-black"
          >
            Tüm Kataloğu Göster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((property, idx) => (
            <div key={property.id} className="flex flex-col h-full space-y-2.5">
              {/* Property Card */}
              <div className="relative flex-1">
                <PropertyCard property={property} priority={idx < 3} />

                {/* AI Match Percentage Badge (Top-left of Card) */}
                {property.matchPercent && (
                  <div className="pointer-events-none absolute top-4 left-4 z-20">
                    <div className="flex items-center gap-1.5 rounded-full border border-gold-400/80 bg-obsidian-950/90 px-3 py-1 text-xs font-bold text-gold-300 shadow-[0_0_20px_rgba(212,175,55,0.5)] backdrop-blur-xl">
                      <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                      <span>%{property.matchPercent} Eşleşme</span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Semantic Reasoning Box (Neden bu ev önerildi?) */}
              {property.aiReason && activeSearchedQuery && (
                <div className="rounded-xl border border-gold-500/20 bg-card/60 p-3 text-xs leading-relaxed text-muted-foreground backdrop-blur-md">
                  <span className="font-semibold text-gold-400 block mb-0.5">
                    Yapay Zekâ Eşleşme Nedeni:
                  </span>
                  <p>{property.aiReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
