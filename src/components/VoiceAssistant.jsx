import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Mic, MicOff, Sparkles, X, Volume2 } from "lucide-react";
import { createSpeechRecognizer } from "../utils/speech.js";

export default function VoiceAssistant() {
  const { t, language, playVoice, setActiveTab, showToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleStartListening = () => {
    setTranscript("");
    const recognizer = createSpeechRecognizer(
      language,
      (spoken) => {
        setTranscript(spoken);
        setListening(false);
        processVoiceCommand(spoken);
      },
      (err) => {
        setListening(false);
        showToast("Could not hear clearly. Try again.", "warning");
      },
      () => {
        setListening(false);
      }
    );

    if (recognizer) {
      setListening(true);
      recognizer.start();
    } else {
      showToast("Speech recognition not supported in your browser.", "warning");
    }
  };

  const processVoiceCommand = (command) => {
    const cmd = command.toLowerCase();

    if (cmd.includes("भाव") || cmd.includes("price") || cmd.includes("mandi") || cmd.includes("रेट") || cmd.includes("rate") || cmd.includes("ధర")) {
      setActiveTab("mandi");
      playVoice(language === "hi" ? "मंडी भाव खोल रहे हैं।" : "Opening live Mandi rates.");
    } else if (cmd.includes("रोग") || cmd.includes("doctor") || cmd.includes("कीड़ा") || cmd.includes("पत्ती") || cmd.includes("disease") || cmd.includes("తెగులు")) {
      setActiveTab("crop-care");
      playVoice(language === "hi" ? "फसल डॉक्टर खोल रहे हैं।" : "Opening AI Crop Doctor.");
    } else if (cmd.includes("बेचें") || cmd.includes("sell") || cmd.includes("बाज़ार") || cmd.includes("market") || cmd.includes("खरीदार")) {
      setActiveTab("market");
      playVoice(language === "hi" ? "सीधा किसान बाज़ार खोल रहे हैं।" : "Opening Direct Produce Market.");
    } else if (cmd.includes("कोल्ड") || cmd.includes("storage") || cmd.includes("भंडारण") || cmd.includes("store")) {
      setActiveTab("storage");
      playVoice(language === "hi" ? "शीत गृह सूची खोल रहे हैं।" : "Opening Cold Storage Directory.");
    } else if (cmd.includes("गाड़ी") || cmd.includes("भाड़ा") || cmd.includes("truck") || cmd.includes("transport") || cmd.includes("logistics")) {
      setActiveTab("logistics");
      playVoice(language === "hi" ? "ग्रामीण वाहन एवं ढुलाई सेवा खोल रहे हैं।" : "Opening Rural Logistics Hub.");
    } else {
      showToast(`Heard: "${command}"`, "info");
    }
  };

  return (
    <>
      {/* Floating Mic Action Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <button
          onClick={() => {
            setIsOpen(true);
            handleStartListening();
          }}
          className="p-3.5 bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white rounded-full shadow-2xl hover:scale-105 transition flex items-center justify-center ring-4 ring-emerald-500/20"
          title="Voice Assistant"
        >
          <Mic className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative">
            <button
              onClick={() => {
                setIsOpen(false);
                setListening(false);
              }}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              {listening ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <Mic className="w-8 h-8 text-emerald-600 relative" />
                </div>
              ) : (
                <MicOff className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <h3 className="font-black text-slate-900 text-base">
              {listening ? t.listeningVoice : "Voice Assistant"}
            </h3>

            {transcript && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-950 font-bold text-sm rounded-xl border border-emerald-200">
                "{transcript}"
              </div>
            )}

            <p className="text-xs text-slate-500 mt-2">
              {t.voiceHint}
            </p>

            <div className="mt-5">
              {!listening ? (
                <button
                  onClick={handleStartListening}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
                >
                  Tap to Speak Again
                </button>
              ) : (
                <button
                  onClick={() => setListening(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
