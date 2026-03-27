import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace these with your actual VAPI credentials found in your dashboard
const VAPI_PUBLIC_KEY = "YOUR_VAPI_PUBLIC_KEY"; 
const VAPI_SQUAD_ID = "YOUR_SQUAD_ID"; 

export default function App() {
  const [callStatus, setCallStatus] = useState("inactive"); // inactive, loading, active, assistant-speaking
  const [volumeLevel, setVolumeLevel] = useState(0);

  useEffect(() => {
    // Only initialize vapi on the client side
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    window.vapi = vapi; // Save globally so toggleCall can access it

    vapi.on("call-start", () => setCallStatus("active"));
    vapi.on("call-end", () => setCallStatus("inactive"));
    vapi.on("speech-start", () => setCallStatus("assistant-speaking"));
    vapi.on("speech-end", () => setCallStatus("active"));
    vapi.on("volume-level", (level) => setVolumeLevel(level));
    vapi.on("error", (e) => {
      console.error(e);
      setCallStatus("inactive");
    });
    
    return () => vapi.removeAllListeners();
  }, []);

  const toggleCall = async () => {
    const vapi = window.vapi;
    if (!vapi) return;

    if (callStatus === "inactive") {
      setCallStatus("loading");
      try {
        await vapi.start(VAPI_SQUAD_ID);
      } catch (err) {
        console.error("Failed to start VAPI call", err);
        setCallStatus("inactive");
      }
    } else {
      setCallStatus("loading");
      vapi.stop();
    }
  };

  // UI mapping based on status
  const isIdle = callStatus === "inactive";
  const isLoading = callStatus === "loading";
  const isActive = callStatus === "active";
  const isAssistantSpeaking = callStatus === "assistant-speaking";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="z-10 flex flex-col items-center gap-12 max-w-lg text-center px-6">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            AI Agent Demo
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg md:text-xl font-medium"
          >
            Tap the microphone to connect and start speaking with our AI team.
          </motion.p>
        </div>

        {/* The beautiful mic button centerpiece */}
        <div className="relative flex items-center justify-center w-64 h-64">
          <AnimatePresence>
            {(isActive || isAssistantSpeaking) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.2 + volumeLevel * 3, 1], // Pulse reacts to volume
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: isAssistantSpeaking ? 0.8 : 0.4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className={`absolute inset-0 rounded-full blur-2xl opacity-60 ${isAssistantSpeaking ? 'bg-purple-500' : 'bg-blue-500'}`}
              />
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCall}
            className={`
              relative z-10 flex items-center justify-center w-32 h-32 rounded-full 
              backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500
              ${isIdle ? 'bg-white/5 hover:bg-white/10' : ''}
              ${isLoading ? 'bg-white/10' : ''}
              ${isActive ? 'bg-blue-500/20 border-blue-500/50 shadow-blue-500/30' : ''}
              ${isAssistantSpeaking ? 'bg-purple-500/20 border-purple-500/50 shadow-purple-500/30' : ''}
            `}
          >
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isActive || isAssistantSpeaking ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </motion.button>
        </div>

        {/* Status text */}
        <div className="h-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={callStatus}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-400 uppercase tracking-widest text-sm font-semibold"
            >
              {isIdle && "Ready to connect"}
              {isLoading && "Connecting to AI..."}
              {isActive && "Listening..."}
              {isAssistantSpeaking && "AI is speaking"}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
