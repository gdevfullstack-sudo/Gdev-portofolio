"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Accueil", href: "#home" },
    { label: "À propos", href: "#about" },
    { label: "Projets", href: "#projects" },
    { label: "Compétences", href: "#skills" },
    { label: "Console", href: "#console" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-[#030712]/80 backdrop-blur-md border-b border-white/10 shadow-lg"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href="#home"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.webp" alt="Logo Gdev" className="h-6 w-6 object-contain" />
              <span className="text-white group-hover:text-accent-cyan transition-colors duration-300">
                Gdev
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-purple transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${isOpen
          ? "max-h-screen opacity-100 border-b border-white/10 bg-[#030712]/95 backdrop-blur-lg"
          : "max-h-0 opacity-0 overflow-hidden"
          }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

