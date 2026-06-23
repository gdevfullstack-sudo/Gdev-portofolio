"use client";

import { useState } from "react";

interface Project {
  title: string;
  description: string;
  category: "frontend" | "backend" | "fullstack";
  tags: string[];
  gradient: string;
  backgroundImage?: string;
  demoUrl: string;
}

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<"tous" | "frontend" | "backend" | "fullstack">("tous");

  const projects: Project[] = [
    {
      title: "Portfolio Biso Tech",
      description: "Une plateforme de présentation de services d'une startup nommée BISO TECH.",
      category: "frontend",
      tags: ["Next.js (React)", "TypeScript", "Tailwind CSS"],
      gradient: "from-indigo-600 via-purple-600 to-accent-purple",
      backgroundImage: "/Bisotech.png",
      demoUrl: "https://bisotech.netlify.app/",
    },
    {
      title: "Zikzone",
      description: "Une plateforme de publication, d'écoute et de téléchargement de musiques avec pages artistes, morceaux récents, morceaux les plus téléchargés et lecteur audio intégré.",
      category: "fullstack",
      tags: ["TypeScript", "Next.js", "Node.js", "PostgreSQL"],
      gradient: "from-rose-500 via-orange-500 to-yellow-500",
      backgroundImage: "/zikzone.webp",
      demoUrl: "https://www.zikzone.com/",
    },
  ];

  const filteredProjects = projects.filter(
    (project) => activeFilter === "tous" || project.category === activeFilter
  );

  const filters: { label: string; value: "tous" | "frontend" | "backend" | "fullstack" }[] = [
    { label: "Tous", value: "tous" },
    { label: "Frontend", value: "frontend" },
    { label: "Backend", value: "backend" },
    { label: "Full-stack", value: "fullstack" },
  ];

  return (
    <section id="projects" className="py-24 relative border-t border-white/5 bg-grid-pattern">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Title */}
        <div className="flex flex-col mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-cyan mb-2">
            02 / Création
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Projets à la une
          </h2>
          <div className="h-1 w-20 bg-accent-cyan mt-3 rounded" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-12 justify-start sm:justify-start">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-5 py-2 rounded-xl text-sm font-mono transition-all duration-300 border ${activeFilter === filter.value
                ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <article
              key={index}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full group"
            >
              {/* Visual preview (Styled placeholder card gradient) */}
              <div
                className="relative h-48 w-full overflow-hidden flex items-center justify-center p-8 bg-gray-950 bg-cover bg-center"
                style={project.backgroundImage ? { backgroundImage: `url(${project.backgroundImage})` } : undefined}
              >
                {project.backgroundImage ? (
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors duration-500" />
                ) : (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20 group-hover:opacity-35 transition-opacity duration-500`} />
                    <div className={`absolute -inset-10 bg-gradient-to-tr ${project.gradient} rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity duration-500`} />
                  </>
                )}

                {/* Tech logo / layout mockup */}
                {!project.backgroundImage && <div className="relative border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm p-4 w-full h-full flex flex-col justify-between overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                      {project.category}
                    </span>
                  </div>
                  <div className="flex justify-center items-center py-2">
                    <span className="text-2xl font-bold tracking-wider font-mono text-white/55 group-hover:text-white/80 transition-colors duration-300">
                      {project.title.split(" ")[0]}
                    </span>
                  </div>
                  <div className="h-1.5 w-1/3 bg-white/20 rounded-full" />
                </div>}
              </div>

              {/* Text info */}
              <div className="p-8 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent-cyan transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 border-t border-white/5 pt-5">
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-white hover:text-accent-cyan flex items-center gap-1 transition-colors"
                    >
                      Démonstration
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

