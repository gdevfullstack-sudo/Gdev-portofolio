"use client";

import { useEffect, useState } from "react";

const ROLES = [
  "Développeur Full-Stack",
  "Créateur d'applications web",
  "Spécialiste Next.js / React",
];

export default function Hero() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = ROLES[currentRoleIndex];

    const handleType = () => {
      if (!isDeleting) {
        // Typing
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(100);

        if (currentText === fullText) {
          // Pause before deleting
          timer = setTimeout(() => setIsDeleting(true), 2000);
          return;
        }
      } else {
        // Deleting
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(50);

        if (currentText === "") {
          setIsDeleting(false);
          setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
          setTypingSpeed(300); // pause before typing next word
          return;
        }
      }

      timer = setTimeout(handleType, typingSpeed);
    };

    timer = setTimeout(handleType, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentRoleIndex, typingSpeed]);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-grid-pattern"
    >
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent-purple/20 rounded-full blur-[100px] animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent-cyan/15 rounded-full blur-[120px] animate-float-medium pointer-events-none" />

      {/* Background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(/1.jpg)` }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center">

        {/* Intro Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm animate-pulse-glow">
          <span className="w-2 h-2 rounded-full bg-accent-purple" />
          <span className="text-xs font-mono text-gray-300 font-medium tracking-wide">
            Disponible pour de nouveaux projets
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Salut, je suis{" "}
          <span className="bg-gradient-to-r from-accent-purple via-violet-400 to-accent-cyan bg-clip-text text-transparent">
            Gdev
          </span>
        </h1>

        {/* Typing Sub-heading */}
        <div className="text-xl sm:text-3xl font-mono text-gray-300 h-10 mb-8 flex items-center justify-center">
          <span>{currentText}</span>
          <span className="w-1 h-8 ml-1 bg-accent-purple animate-blink" />
        </div>

        {/* Description */}
        <p className="max-w-2xl text-base sm:text-lg text-gray-400 mb-10 leading-relaxed">
          Je conçois et développe des applications web performantes, esthétiques et innovantes. Spécialisé dans l&apos;écosystème React, Next.js et Node.js, j&apos;aime transformer les idées complexes en expériences utilisateur mémorables.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <a
            href="#projects"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent-purple hover:bg-violet-600 text-white font-medium text-center transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transform hover:-translate-y-0.5"
          >
            Explorer mes projets
          </a>
          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium text-center transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-0.5"
          >
            Me contacter
          </a>
        </div>
      </div>

      {/* Decorative scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">Défiler</span>
        <div className="w-5 h-8 border-2 border-gray-400 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

