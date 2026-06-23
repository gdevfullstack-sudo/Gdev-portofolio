"use client";

import React, { useState, useRef, useEffect } from "react";

interface TerminalLine {
  text: string;
  type: "input" | "output" | "error" | "system";
}

const BANNER = `
   ____ ____  _______     __     ___  ____
  / ___|  _ \\| ____\\ \\   / /    / _ \\/ ___|
 | |  _| | | |  _|  \\ \\ / /    | | | \\___ \\
 | |_| | |_| | |___  \\ V /     | |_| |___) |
  \\____|____/|_____|  \\_/       \\___/|____/  v1.0.0
  -------------------------------------------------------------
  Tapez 'help' pour voir la liste des commandes disponibles.
`;

export default function TerminalConsole() {
  const [history, setHistory] = useState<TerminalLine[]>([
    { text: BANNER, type: "system" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedInput = inputValue.trim();
      if (!trimmedInput) return;

      const newHistory = [...history, { text: `guest@gdev-os:~$ ${trimmedInput}`, type: "input" as const }];
      
      // Save to command history for up/down arrow cycling
      const updatedCmdHistory = [trimmedInput, ...commandHistory];
      setCommandHistory(updatedCmdHistory);
      setHistoryIndex(-1);

      processCommand(trimmedInput, newHistory);
      setInputValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue("");
      }
    }
  };

  const processCommand = (cmd: string, currentHistory: TerminalLine[]) => {
    const args = cmd.toLowerCase().split(" ");
    const primaryCmd = args[0];

    let outputLines: TerminalLine[] = [];

    switch (primaryCmd) {
      case "help":
        outputLines = [
          { text: "Commandes disponibles :", type: "system" },
          { text: "  about    - Présentation rapide de mon profil.", type: "output" },
          { text: "  skills   - Liste structurée de mes compétences techniques.", type: "output" },
          { text: "  projects - Liste de mes projets récents.", type: "output" },
          { text: "  contact  - Informations pour me contacter.", type: "output" },
          { text: "  banner   - Afficher la bannière système d'accueil.", type: "output" },
          { text: "  clear    - Vider l'écran du terminal.", type: "output" }
        ];
        break;
      case "banner":
        outputLines = [{ text: BANNER, type: "system" }];
        break;
      case "clear":
        setHistory([]);
        return;
      case "about":
        outputLines = [
          { text: "Nom : Gdev", type: "system" },
          { text: "Rôle : Développeur Full-Stack & Designer Créatif", type: "system" },
          { text: "Localisation : France (Télétravail mondial disponible)", type: "system" },
          { text: "Description : Passionné par les détails, j'adore créer des applications web robustes avec Next.js et React, tout en veillant à optimiser les performances pour le SEO et le temps de réponse.", type: "output" }
        ];
        break;
      case "skills":
        outputLines = [
          { text: "COMPÉTENCES TECHNIQUES", type: "system" },
          { text: "- Frontend : [React, Next.js, TypeScript, Tailwind, Vue]", type: "output" },
          { text: "- Backend  : [Node.js, Express, NestJS, Python, GraphQL]", type: "output" },
          { text: "- DevOps   : [Docker, AWS, CI/CD, Git, InfluxDB]", type: "output" },
          { text: "- Créatif  : [Three.js, WebGL, Figma UX/UI, Shaders]", type: "output" }
        ];
        break;
      case "projects":
        outputLines = [
          { text: "PROJETS RÉCENTS", type: "system" },
          { text: "1. Aether Cloud   - Plateforme cloud décentralisée (Next.js, Python, IPFS).", type: "output" },
          { text: "2. Ignis Engine   - Moteur de rendu 3D haute performance (Three.js, WebGL).", type: "output" },
          { text: "3. Komorebi       - Éditeur Markdown minimaliste zen (React, Electron).", type: "output" },
          { text: "4. Vespera        - Dashboard analytics pour APIs GraphQL (Node.js, Redis).", type: "output" },
          { text: "Pour plus d'informations visuelles, faites défiler vers la section 'Projets'.", type: "system" }
        ];
        break;
      case "contact":
        outputLines = [
          { text: "CONTACTER GDEV", type: "system" },
          { text: "- E-mail   : gdevfullstack@gmail.com", type: "output" },
          { text: "- GitHub   : github.com/gdev", type: "output" },
          { text: "- LinkedIn : linkedin.com/in/gdev", type: "output" },
          { text: "- Conseil  : Utilisez le formulaire plus bas pour m'envoyer un message en direct !", type: "system" }
        ];
        break;
      default:
        outputLines = [
          { text: `gdev-os: commande introuvable: '${cmd}'.`, type: "error" },
          { text: "Tapez 'help' pour obtenir la liste des commandes.", type: "system" }
        ];
    }

    setHistory([...currentHistory, ...outputLines]);
  };

  return (
    <section id="console" className="py-24 bg-[#030712] relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        {/* Title */}
        <div className="flex flex-col mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-purple mb-2">
            04 / Terminal Interactif
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Gdev OS
          </h2>
          <div className="h-1 w-20 bg-accent-purple mt-3 rounded" />
        </div>

        {/* Terminal Window Box */}
        <div
          onClick={focusInput}
          className="relative rounded-2xl border border-white/10 bg-gray-950/90 shadow-2xl h-[450px] flex flex-col overflow-hidden cursor-text"
        >
          {/* Scanline background effect */}
          <div className="absolute inset-0 terminal-scanline pointer-events-none z-20" />

          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 border-b border-white/5 select-none shrink-0 z-10">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-xs font-mono text-gray-400 font-bold">
              guest@gdev-os:~
            </span>
            <div className="w-14" /> {/* spacer */}
          </div>

          {/* Terminal Console Buffer */}
          <div
            ref={containerRef}
            className="flex-grow p-6 overflow-y-auto font-mono text-sm leading-relaxed text-gray-300 space-y-2.5 z-10"
          >
            {history.map((line, i) => (
              <pre
                key={i}
                className={`whitespace-pre-wrap ${
                  line.type === "input"
                    ? "text-white font-bold"
                    : line.type === "error"
                    ? "text-rose-400"
                    : line.type === "system"
                    ? "text-accent-cyan font-semibold"
                    : "text-gray-400"
                }`}
              >
                {line.text}
              </pre>
            ))}

            {/* Prompt line */}
            <div className="flex items-center text-white font-bold pt-1.5">
              <span className="text-accent-purple mr-2 shrink-0">guest@gdev-os:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow bg-transparent border-none outline-none text-white font-mono p-0 focus:ring-0"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

