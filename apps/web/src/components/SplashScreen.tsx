import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out after 1.2 seconds
    const fadeTimer = setTimeout(() => setIsFading(true), 1200);
    // Remove from DOM completely after fade animation ends
    const removeTimer = setTimeout(() => setIsVisible(false), 1700); 

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0c0a09] flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <img
        src="/logo.svg"
        alt="Palastra"
        className="h-16 w-16 drop-shadow-2xl animate-pulse"
      />
      <div className="mt-4 text-white text-xl font-semibold tracking-tight opacity-80">
        Palastra
      </div>
    </div>
  );
}
