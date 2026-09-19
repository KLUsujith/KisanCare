import React from "react";
import { X, Play, Film, CheckCircle2, Download, Sparkles } from "lucide-react";

export default function DemoVideoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full border border-emerald-500/40 shadow-2xl overflow-hidden relative my-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>KisanCare Platform Walkthrough Video</span>
                <span className="text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  డెమో వీడియో
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                16-Second High-Definition Overview of Farmer & Admin Features
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="bg-black relative aspect-video flex items-center justify-center">
          <video
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
            src="/demo_sample.webm"
          >
            <source src="/demo_sample.webm" type="video/webm" />
            <source src="/demo_sample.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Walkthrough Timeline Highlights */}
        <div className="p-4 sm:p-5 bg-slate-900/95 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] font-bold text-emerald-400 block uppercase">0:00 - 0:03</span>
              <span className="font-extrabold text-white text-xs">Platform Intro</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Telugu & English regional portal</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] font-bold text-blue-400 block uppercase">0:03 - 0:06</span>
              <span className="font-extrabold text-white text-xs">Role-Based Auth</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Farmer OTP & Hidden Admin</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] font-bold text-emerald-400 block uppercase">0:06 - 0:09</span>
              <span className="font-extrabold text-white text-xs">AI Crop Doctor</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Leaf scan & organic dosage</p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] font-bold text-amber-400 block uppercase">0:09 - 0:16</span>
              <span className="font-extrabold text-white text-xs">Market & Admin</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Mandi rates & 0% FPOs</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Full HD 1280x720 • Built for Indian farmers</span>
            </span>

            <a
              href="/demo_sample.mp4"
              download="KisanCare_Demo.mp4"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Video</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
