// Web Speech API Voice synthesis and recognition utilities

const LANG_VOICE_MAP = {
  hi: "hi-IN",
  en: "en-IN",
  te: "te-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  pa: "pa-IN",
  kn: "kn-IN"
};

export function speakText(text, langCode = "hi", onEnd = null) {
  if (!("speechSynthesis" in window)) {
    console.warn("Text-to-speech not supported in this browser.");
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const targetLang = LANG_VOICE_MAP[langCode] || "hi-IN";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLang;
  utterance.rate = 0.92; // Slightly slower, clear tone for rural users
  utterance.pitch = 1.0;

  // Find native or regional voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang.split("-")[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function createSpeechRecognizer(langCode = "hi", onResult, onError, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = LANG_VOICE_MAP[langCode] || "hi-IN";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
