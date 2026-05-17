import React from "react";

export default function Preloader({ text = "" }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#a7cf26]">
      <div className="flex items-end gap-2">
        <span className="preloader-line h-8 w-2 rounded-full bg-white"></span>
        <span className="preloader-line h-12 w-2 rounded-full bg-white [animation-delay:0.12s]"></span>
        <span className="preloader-line h-8 w-2 rounded-full bg-white [animation-delay:0.24s]"></span>
      </div>

      {text && (
        <p className="mt-5 text-sm font-black uppercase tracking-[0.22em] text-black">
          {text}
        </p>
      )}

      <style>{`
        .preloader-line {
          animation: preloaderPulse 0.55s ease-in-out infinite;
          transform-origin: center bottom;
        }

        @keyframes preloaderPulse {
          0%, 100% {
            transform: scaleY(0.55);
            opacity: 0.65;
          }
          50% {
            transform: scaleY(1.25);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}