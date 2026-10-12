"use client";

import React, { useState, useCallback } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Phone, PhoneOff, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function VoiceAgentInner({ onClose }: { onClose: () => void }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedClient, setSubmittedClient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const conversation = useConversation({
    onConnect: () => {
      setErrorMessage("");
      console.log("Connected to ElevenLabs voice agent");
    },
    onDisconnect: () => {
      console.log("Voice agent disconnected");
    },
    onError: (err) => {
      console.error("Voice agent error:", err);
      setErrorMessage(typeof err === "string" ? err : "Connection error. Please check your mic and try again.");
    },
  });

  const handleStartCall = useCallback(async () => {
    setErrorMessage("");
    try {
      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId || agentId === "your_copied_agent_id") {
        setErrorMessage("Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local.");
        return;
      }

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
              return "Success! The project inquiry has been delivered directly to Gohar Abbas.";
            } catch (err) {
              console.error("Tool execution failed:", err);
              return "Failed to submit due to network error.";
            }
          },
        },
      });
    } catch (error) {
      console.error("Microphone access denied or session failed:", error);
      setErrorMessage("Microphone permission denied. Please allow microphone access to talk to the AI agent.");
    }
  }, [conversation]);

  const handleEndCall = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("Error ending session:", err);
    }
  }, [conversation]);

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#55dd4a]/30 bg-[#121413] p-7 text-white shadow-2xl shadow-[#55dd4a]/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#55dd4a]/15 text-[#55dd4a]">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Gohar's AI Agent</h3>
              <p className="text-xs text-[#999c91]">
                {isConnected
                  ? conversation.isSpeaking
                    ? "Speaking..."
                    : "Listening..."
                  : isConnecting
                  ? "Connecting..."
                  : "Live Voice Consultation"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isConnected) handleEndCall();
              onClose();
            }}
            className="text-xs uppercase tracking-wider text-white/50 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Close
          </button>
        </div>

        {/* Visualizer Area */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative grid place-items-center size-36">
            {isConnected && (
              <>
                <motion.div
                  animate={{
                    scale: conversation.isSpeaking ? [1, 1.4, 1] : [1, 1.15, 1],
                    opacity: conversation.isSpeaking ? [0.4, 0.08, 0.4] : 0.15,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: conversation.isSpeaking ? 1.2 : 2.5,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full bg-[#55dd4a]"
                />
                <motion.div
                  animate={{
                    scale: conversation.isSpeaking ? [1, 1.22, 1] : 1,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.1,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-4 rounded-full border border-[#55dd4a]/40"
                />
              </>
            )}
            <div className="grid size-24 place-items-center rounded-full bg-gradient-to-tr from-[#1b2b1a] to-[#254623] border border-[#55dd4a]/50 shadow-lg text-[#55dd4a]">
              <Phone size={32} />
            </div>
          </div>

          {/* Status indicator */}
          <p className="mt-5 text-center text-sm text-white/80 max-w-xs font-light">
            {isConnected
              ? conversation.isSpeaking
                ? "Agent is speaking..."
                : "Go ahead, I'm listening..."
              : isConnecting
              ? "Connecting to voice agent..."
              : "Talk directly to learn about services or discuss your project idea"}
          </p>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300"
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Notification when contact form is submitted mid-call */}
          {formSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl border border-[#55dd4a]/30 bg-[#55dd4a]/10 px-4 py-2.5 text-xs text-[#77e46e]"
            >
              <CheckCircle2 size={16} />
              <span>Project brief sent for {submittedClient}!</span>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-5 border-t border-white/10">
          {!isConnected ? (
            <button
              onClick={handleStartCall}
              disabled={isConnecting}
              className="flex items-center gap-2.5 rounded-full bg-[#55dd4a] px-7 py-3 text-sm font-semibold text-[#122315] shadow-lg shadow-[#55dd4a]/20 transition hover:bg-[#4bc740] hover:scale-105 disabled:opacity-50"
            >
              <Phone size={17} />
              <span>{isConnecting ? "Connecting..." : "Start Voice Call"}</span>
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600 hover:scale-105"
            >
              <PhoneOff size={16} />
              <span>End Call</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VoiceAgentModal({ isOpen, onClose }: VoiceAgentModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ConversationProvider>
        <VoiceAgentInner onClose={onClose} />
      </ConversationProvider>
    </AnimatePresence>
  );
}
