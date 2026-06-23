"use client";

interface Skill {
  name: string;
  level: "Expert" | "Avancé" | "Intermédiaire";
  glowColor: string; // Tailored classes for border/glow
}

interface SkillCategory {
  title: string;
  icon: React.ReactNode;
  skills: Skill[];
}

export default function Skills() {
  const categories: SkillCategory[] = [
    {
      title: "Développement frontend",
      icon: (
        <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      skills: [
        { name: "React / React 19", level: "Expert", glowColor: "hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-400" },
        { name: "Next.js (App Router)", level: "Expert", glowColor: "hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] text-white" },
        { name: "TypeScript", level: "Expert", glowColor: "hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-400" },
        { name: "Tailwind CSS v4", level: "Expert", glowColor: "hover:border-teal-400/50 hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] text-teal-300" },
        { name: "HTML5 / CSS3", level: "Expert", glowColor: "hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] text-orange-400" },
        { name: "Vue.js", level: "Intermédiaire", glowColor: "hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400" }
      ]
    },
    {
      title: "Backend & systèmes",
      icon: (
        <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      skills: [
        { name: "Node.js / Express", level: "Expert", glowColor: "hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] text-green-400" },
        { name: "GraphQL / REST APIs", level: "Avancé", glowColor: "hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] text-pink-400" },
        { name: "Python", level: "Avancé", glowColor: "hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] text-yellow-400" },
        { name: "NestJS", level: "Avancé", glowColor: "hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] text-red-500" },
        { name: "PostgreSQL", level: "Avancé", glowColor: "hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] text-blue-300" },
        { name: "Redis", level: "Avancé", glowColor: "hover:border-red-600/50 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] text-red-400" }
      ]
    },
    {
      title: "DevOps & outils créatifs",
      icon: (
        <svg className="w-5 h-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      skills: [
        { name: "Docker", level: "Avancé", glowColor: "hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] text-blue-400" },
        { name: "Git / GitHub Actions", level: "Expert", glowColor: "hover:border-orange-600/50 hover:shadow-[0_0_15px_rgba(234,88,12,0.3)] text-orange-500" },
        { name: "AWS (S3, EC2)", level: "Intermédiaire", glowColor: "hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] text-yellow-500" },
        { name: "Three.js / WebGL", level: "Avancé", glowColor: "hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] text-purple-300" },
        { name: "Figma (UI/UX)", level: "Avancé", glowColor: "hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] text-purple-400" },
        { name: "Jest / Cypress", level: "Avancé", glowColor: "hover:border-emerald-600/50 hover:shadow-[0_0_15px_rgba(5,150,105,0.3)] text-emerald-500" }
      ]
    }
  ];

  return (
    <section id="skills" className="py-24 bg-[#030712]/50 relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title */}
        <div className="flex flex-col mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-emerald mb-2">
            03 / Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Compétences & Technologies
          </h2>
          <div className="h-1 w-20 bg-accent-emerald mt-3 rounded" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="glass-panel p-8 rounded-2xl flex flex-col h-full relative"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="p-2 bg-white/5 rounded-xl">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {category.title}
                </h3>
              </div>

              {/* Skills Badges Grid */}
              <div className="flex flex-col gap-3.5 flex-grow">
                {category.skills.map((skill, sIndex) => (
                  <div
                    key={sIndex}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 cursor-default ${skill.glowColor}`}
                  >
                    <span className="text-sm font-semibold tracking-wide">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-gray-400">
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

