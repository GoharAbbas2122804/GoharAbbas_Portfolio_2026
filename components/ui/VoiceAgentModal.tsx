"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import {
  Phone,
  PhoneOff,
  Sparkles,
  CheckCircle2,
  Mic,
  MicOff,
  RefreshCw,
  X,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_CALL_DURATION_SEC = 120; // 2 minutes hard cutoff to protect credits
const MAX_DAILY_CALLS = 2; // Maximum calls per user per day

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getDailyUsage(): { count: number; date: string } {
  if (typeof window === "undefined") return { count: 0, date: "" };
  try {
    const raw = localStorage.getItem("gohar_voice_usage");
    if (!raw) return { count: 0, date: getTodayString() };
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayString()) {
      return { count: 0, date: getTodayString() };
    }
    return parsed;
  } catch {
    return { count: 0, date: getTodayString() };
  }
}

function incrementDailyUsage(): number {
  if (typeof window === "undefined") return 1;
  try {
    const current = getDailyUsage();
    const newCount = current.count + 1;
    localStorage.setItem("gohar_voice_usage", JSON.stringify({ count: newCount, date: getTodayString() }));
    return newCount;
  } catch {
    return 1;
  }
}

function ElevenLabsVoiceInner({ onClose }: { onClose: () => void }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedClient, setSubmittedClient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPermDenied, setIsPermDenied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Guardrail states
  const [timeLeft, setTimeLeft] = useState(MAX_CALL_DURATION_SEC);
  const [dailyUsage, setDailyUsage] = useState(0);
  const isLimitReached = dailyUsage >= MAX_DAILY_CALLS;

  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDailyUsage(getDailyUsage().count);
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      setErrorMessage("");
      setIsPermDenied(false);
      setTimeLeft(MAX_CALL_DURATION_SEC);
      console.log("Connected to ElevenLabs voice agent");
    },
    onDisconnect: () => {
      console.log("Voice agent disconnected");
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    },
    onError: (err: unknown) => {
      console.error("Voice agent error:", err);
      const str =
        typeof err === "string"
          ? err
          : (err as { message?: string })?.message || "An error occurred with the voice agent.";
      setErrorMessage(str);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    },
  });

  const {
    status,
    isSpeaking,
    isMuted,
    setMuted,
    getOutputByteFrequencyData,
    getInputByteFrequencyData,
  } = conversation;

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  // Countdown timer guardrail (hard auto-disconnect at 0)
  useEffect(() => {
    if (isConnected) {
      setTimeLeft(MAX_CALL_DURATION_SEC);
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto disconnect when time expires
            conversation.endSession();
            setErrorMessage("Call reached the 2-minute consultation limit to preserve availability. Please use the contact form for more details.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isConnected, conversation]);

  // Audio frequency loop for reactive motion
  useEffect(() => {
    if (!isConnected) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setAudioLevel(0);
      return;
    }

    const updateVisualizer = () => {
      try {
        const freqData = isSpeaking
          ? getOutputByteFrequencyData?.()
          : getInputByteFrequencyData?.();

        if (freqData && freqData.length > 0) {
          let sum = 0;
          const sampleCount = Math.min(24, freqData.length);
          for (let i = 0; i < sampleCount; i++) {
            sum += freqData[i];
          }
          const avg = sum / sampleCount / 255;
          setAudioLevel(avg);
        }
      } catch {
        // Ignored
      }
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isConnected, isSpeaking, getOutputByteFrequencyData, getInputByteFrequencyData]);

  const handleStartCall = useCallback(async () => {
    setErrorMessage("");
    setIsPermDenied(false);

    // Guardrail: check daily call quota
    const currentUsage = getDailyUsage().count;
    if (currentUsage >= MAX_DAILY_CALLS) {
      setErrorMessage("You have used your 2 voice calls for today. Please reach Gohar via the contact form.");
      return;
    }

    try {
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId || agentId === "your_copied_agent_id") {
        setErrorMessage("Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local.");
        return;
      }

      // Proactively test mic permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr: unknown) {
        const errObj = permErr as { name?: string; message?: string };
        if (errObj.name === "NotAllowedError" || errObj.name === "PermissionDeniedError") {
          setIsPermDenied(true);
          setErrorMessage(
            "Microphone access was denied. Please allow microphone permissions in your browser."
          );
          return;
        } else if (errObj.name === "NotFoundError" || errObj.name === "DevicesNotFoundError") {
          setErrorMessage("No microphone detected. Please connect a microphone.");
          return;
        }
        throw permErr;
      }

      // Record this call towards daily usage
      const updated = incrementDailyUsage();
      setDailyUsage(updated);

      await conversation.startSession({
        agentId,
        clientTools: {
          submit_contact_form: async (params: Record<string, string>) => {
            try {
              const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
              });

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                return `Error submitting brief: ${data?.error || "Submission failed"}`;
              }

              setFormSubmitted(true);
              setSubmittedClient(params.name || "Client");

              // Guardrail: Auto-hangup 5 seconds after form submission to avoid lingering credit consumption
              setTimeout(() => {
                try {
                  conversation.endSession();
                } catch {
                  // Ignored
                }
              }, 5000);

              return "Success! The project inquiry has been delivered directly to Gohar Abbas.";
            } catch (err) {
              console.error("Tool execution failed:", err);
              return "Failed to submit brief due to network error.";
            }
          },
        },
      });
    } catch (error: unknown) {
      console.error("Session start error:", error);
      const err = error as { name?: string; message?: string };
      if (err.name === "NotAllowedError" || err.message?.includes("Permission denied")) {
        setIsPermDenied(true);
        setErrorMessage(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      } else {
        setErrorMessage(err.message || "Failed to start call. Please check your connection.");
      }
    }
  }, [conversation]);

  const handleEndCall = useCallback(async () => {
    try {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      await conversation.endSession();
    } catch (err) {
      console.error("Error ending session:", err);
    }
  }, [conversation]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[390px] overflow-hidden rounded-[32px] border border-white/[0.12] bg-[#0c0d10] p-6 text-white shadow-[0_30px_90px_-15px_rgba(0,0,0,0.95)]"
      >
        {/* Subtle ambient diagonal stripe texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 16px)",
          }}
        />

        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-56 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Top Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-full bg-white/[0.06] border border-white/10 text-white/90">
              <Sparkles size={14} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white">Gohar's Voice AI</h3>
              <p className="text-[11px] text-white/50">
                {isConnected
                  ? isSpeaking
                    ? "Agent Speaking..."
                    : "Listening..."
                  : isConnecting
                  ? "Connecting..."
                  : "Conversational Agent"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Call Duration Countdown Guardrail Badge */}
            {isConnected && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${
                  timeLeft <= 20
                    ? "bg-red-500/15 border-red-500/30 text-red-300 animate-pulse"
                    : "bg-white/[0.06] border-white/10 text-white/80"
                }`}
              >
                <Clock size={11} />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={() => {
                if (isConnected) handleEndCall();
                onClose();
              }}
              aria-label="Close"
              className="grid size-8 place-items-center rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.12] transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Center: The Iconic ElevenLabs Holographic Iris Orb */}
        <div className="relative flex flex-col items-center justify-center pt-8 pb-6">
          <div className="relative grid place-items-center size-52">
            {/* Background Organic Aurora Wave (Fluid breathing shape) */}
            <motion.div
              animate={{
                scale: isConnected ? [1, 1.12 + audioLevel * 0.25, 1] : [1, 1.05, 1],
                borderRadius: isConnected
                  ? [
                      "48% 52% 58% 42% / 52% 48% 52% 48%",
                      "56% 44% 48% 52% / 44% 56% 44% 56%",
                      "48% 52% 58% 42% / 52% 48% 52% 48%",
                    ]
                  : "50%",
                opacity: isConnected ? [0.65, 0.9, 0.65] : 0.45,
              }}
              transition={{
                repeat: Infinity,
                duration: isSpeaking ? 2 : 4,
                ease: "easeInOut",
              }}
              className="absolute inset-2 bg-gradient-to-tr from-[#38bdf8]/40 via-[#0284c7]/30 to-[#a5f3fc]/50 blur-xl"
            />

            {/* The Main Circular Pinwheel / Holographic Iris Orb */}
            <motion.div
              animate={{
                rotate: isConnected ? 360 : [0, 15, -15, 0],
                scale: isConnected ? 1 + audioLevel * 0.12 : 1,
              }}
              transition={{
                rotate: isConnected
                  ? { repeat: Infinity, duration: isSpeaking ? 7 : 16, ease: "linear" }
                  : { repeat: Infinity, duration: 6, ease: "easeInOut" },
                scale: { duration: 0.1, ease: "easeOut" },
              }}
              className="relative size-44 rounded-full overflow-hidden shadow-[0_10px_35px_rgba(2,132,199,0.3)] border border-white/20"
              style={{
                background:
                  "conic-gradient(from 0deg, #023e8a 0deg, #0284c7 35deg, #ffffff 65deg, #e0f2fe 95deg, #023e8a 130deg, #0284c7 165deg, #ffffff 195deg, #e0f2fe 225deg, #023e8a 260deg, #0284c7 295deg, #ffffff 325deg, #e0f2fe 345deg, #023e8a 360deg)",
              }}
            >
              {/* Subtle radial center highlight for optical iris depth */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 35%, rgba(2,62,138,0.2) 75%, transparent 100%)",
                }}
              />
            </motion.div>

            {/* Floating Black Overlapping Call Button */}
            <motion.button
              whileHover={{ scale: isLimitReached && !isConnected ? 1 : 1.08 }}
              whileTap={{ scale: isLimitReached && !isConnected ? 1 : 0.94 }}
              onClick={isConnected ? handleEndCall : handleStartCall}
              disabled={isConnecting || (isLimitReached && !isConnected)}
              aria-label={isConnected ? "End call" : "Start call"}
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 grid size-12 place-items-center rounded-full border-2 shadow-2xl transition duration-200 z-10 ${
                isConnected
                  ? "bg-red-600 border-white text-white shadow-red-600/40 hover:bg-red-700"
                  : isLimitReached
                  ? "bg-stone-800 border-white/20 text-white/30 cursor-not-allowed"
                  : "bg-[#0b0c10] border-white text-white shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:bg-[#151722]"
              }`}
            >
              {isConnected ? (
                <PhoneOff size={18} className="text-white" />
              ) : (
                <Phone size={18} className="text-white fill-white" />
              )}
            </motion.button>
          </div>

          {/* Status Message */}
          <div className="mt-5 text-center px-4">
            <p className="text-xs font-medium text-white/80">
              {isConnected
                ? isSpeaking
                  ? "Agent is answering..."
                  : isMuted
                  ? "Microphone is muted"
                  : "Listening to you..."
                : isConnecting
                ? "Connecting..."
                : isLimitReached
                ? "Daily call limit reached (2/2)"
                : "Tap the call button to talk"}
            </p>
            <p className="text-[11px] text-white/45 mt-1">
              {isConnected
                ? timeLeft <= 20
                  ? "Call will wrap up shortly to preserve credits"
                  : "Speak concisely: services, budget, and contact info"
                : isLimitReached
                ? "Use the form below to submit your project details directly"
                : "2-minute consultation limit • Web, App, AI Agents"}
            </p>
          </div>

          {/* Guardrail: Daily Limit Reached Card */}
          {isLimitReached && !isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-xs text-white/80 text-center"
            >
              <p className="text-[11px] text-white/60 mb-2">
                To prevent spam and conserve credits, voice calls are capped at 2 per visitor per day.
              </p>
              <Link
                href="/contact"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 px-3.5 py-1.5 text-[11px] font-medium text-white transition"
              >
                <span>Go to Contact Form</span>
                <ArrowRight size={12} />
              </Link>
            </motion.div>
          )}

          {/* Form Submitted Success Badge */}
          {formSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-4 flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/50 px-4 py-2 text-xs text-cyan-200 shadow-lg"
            >
              <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
              <span>Project brief delivered for <strong>{submittedClient}</strong>!</span>
            </motion.div>
          )}

          {/* Permission Blocked Guide / Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 w-full rounded-2xl border border-red-500/25 bg-red-950/40 p-3.5 text-xs text-red-200"
            >
              <div className="flex items-start gap-2">
                <ShieldAlert size={15} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="font-medium text-red-200">{errorMessage}</p>

                  {isPermDenied && (
                    <div className="rounded-xl bg-black/40 p-2.5 border border-red-400/10 text-[11px] text-white/70 space-y-1">
                      <p className="font-semibold text-white">To unblock mic:</p>
                      <p>Click the <strong>tune / lock icon 🔒</strong> in your URL bar, change <em>Microphone</em> to <strong>Allow</strong>, then retry.</p>
                    </div>
                  )}

                  {isPermDenied && (
                    <button
                      onClick={handleStartCall}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-400/30 px-3 py-1.5 text-[11px] font-medium text-red-100 hover:bg-red-500/30 transition"
                    >
                      <RefreshCw size={12} />
                      <span>Retry Microphone</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Bar: In-call Mute controls or idle action */}
        {isConnected && (
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => setMuted(!isMuted)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition ${
                isMuted
                  ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                  : "bg-white/[0.06] border-white/10 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
              <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
            </button>

            <button
              onClick={handleEndCall}
              className="flex items-center gap-1.5 rounded-full bg-red-600/90 hover:bg-red-600 px-4 py-2 text-xs font-medium text-white transition"
            >
              <PhoneOff size={14} />
              <span>End Call</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VoiceAgentModal({ isOpen, onClose }: VoiceAgentModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ConversationProvider>
        <ElevenLabsVoiceInner onClose={onClose} />
      </ConversationProvider>
    </AnimatePresence>
  );
}
