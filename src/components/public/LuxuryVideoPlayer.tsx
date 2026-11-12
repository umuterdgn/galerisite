"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Sparkles,
  Film,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface LuxuryVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  autoPlay?: boolean;
  className?: string;
}

export function LuxuryVideoPlayer({
  src,
  poster,
  title = "Sinematik Tanıtım & Çevre Analizi",
  subtitle = "4K Ultra-HD Drone & Mimari Çekim",
  badgeText = "4K UHD",
  autoPlay = false,
  className = "",
}: LuxuryVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Seek time
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Skip 10 seconds
  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(duration, videoRef.current.currentTime + seconds)
    );
  };

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
    if (!newMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Auto-hide controls when playing and idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Clean timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPlaying) setShowControls(false);
      }}
      className={`group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-500/30 bg-[#06070a] shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-300 ${className}`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        className="h-[480px] w-full sm:h-[600px] md:h-[660px] object-cover cursor-pointer"
      />

      {/* Top Header Overlay: Title & Luxury Watermark */}
      <AnimatePresence>
        {(showControls || !isPlaying || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-[#06070a]/90 via-[#06070a]/40 to-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/40 bg-[#06070a]/80 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.25)] backdrop-blur-md">
                <Film className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold tracking-widest text-gold-500 uppercase">
                    {subtitle}
                  </span>
                </div>
                <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
                  {title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-gold-500/30 bg-[#06070a]/70 text-[10px] font-medium text-gold-300 backdrop-blur-md"
              >
                <Sparkles className="mr-1 h-3 w-3 text-gold-400" />
                {badgeText}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Luxury Play / Pause Icon Button */}
      <AnimatePresence>
        (!isPlaying || isHovered) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={togglePlay}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/60 bg-[#06070a]/75 text-gold-400 shadow-[0_0_30px_rgba(212,175,55,0.4)] backdrop-blur-xl hover:scale-110 hover:border-gold-400 hover:text-white transition-all duration-300"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </motion.button>
        )
      </AnimatePresence>

      {/* Bottom Luxury Control Bar */}
      <AnimatePresence>
        {(showControls || !isPlaying || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-[#06070a]/95 via-[#06070a]/60 to-transparent"
          >
            {/* Custom Gold Progress Slider Bar */}
            <div className="relative mb-3 flex items-center group/scrubber cursor-pointer">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20 transition-all group-hover/scrubber:h-2.5">
                <div
                  className="h-full bg-gold-gradient transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Controls Ribbon */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: Play/Pause, Skips, Timestamp */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={togglePlay}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/30 hover:bg-gold-500/20 hover:text-white transition-all active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>

                {/* Skip 10s Backward */}
                <button
                  onClick={() => handleSkip(-10)}
                  title="10 saniye geri sar"
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl text-zinc-300 hover:bg-white/10 hover:text-gold-400 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Skip 10s Forward */}
                <button
                  onClick={() => handleSkip(10)}
                  title="10 saniye ileri sar"
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl text-zinc-300 hover:bg-white/10 hover:text-gold-400 transition-all"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                {/* Timestamp */}
                <div className="text-xs font-mono text-zinc-300 ml-1">
                  <span className="text-white font-semibold">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-zinc-600 mx-1">/</span>
                  <span className="text-zinc-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right: Volume & Fullscreen */}
              <div className="flex items-center gap-3">
                {/* Volume Controller */}
                <div className="flex items-center gap-2 group/vol">
                  <button
                    onClick={toggleMute}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-300 hover:bg-white/10 hover:text-gold-400 transition-all"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4 text-red-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 accent-gold-500 cursor-pointer hidden sm:block"
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-300 hover:bg-white/10 hover:text-gold-400 transition-all active:scale-95"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

