export default function About() {
  const stats = [
    { value: "2+", label: "Années d'expérience" },
    { value: "2+", label: "Projets livrés" },
    { value: "99.9%", label: "Taux de disponibilité" },
    { value: "15+", label: "Technologies maîtrisées" },
  ];

  const coreValues = [
    {
      title: "Performance & Optimisation",
      description: "Chargement instantané, architectures serverless et optimisation SEO pour un impact maximal.",
      icon: (
        <svg className="w-6 h-6 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Expérience utilisateur (UX)",
      description: "Interfaces intuitives, fluides et accessibles, développées dans le respect des standards web.",
      icon: (
        <svg className="w-6 h-6 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: "Code robuste & propre",
      description: "Architecture modulaire et typée avec TypeScript, couverte par des tests automatisés.",
      icon: (
        <svg className="w-6 h-6 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#030712]/50 relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">

        {/* Title */}
        <div className="flex flex-col mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-purple mb-2">
            01 / Découverte
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            À propos de moi
          </h2>
          <div className="h-1 w-20 bg-accent-purple mt-3 rounded" />
        </div>

        {/* Top Section: Story and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-200">
              Ingénieur passionné par le code bien conçu et l&apos;esthétique du web.
            </h3>
            <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
              Depuis plus de 2 ans, j&apos;accompagne des startups et entreprises à travers le monde dans la création d&apos;expériences numériques sur mesure. Mon parcours technique me permet de naviguer aisément de la conception de bases de données jusqu&apos;à l&apos;intégration minutieuse de designs animés.
            </p>
            <p className="text-gray-400 leading-relaxed text-base">
              Je crois fermement que le développement web ne se limite pas à écrire du code qui fonctionne : c&apos;est un art consistant à optimiser les ressources, sécuriser les données et offrir un parcours interactif inoubliable pour chaque visiteur.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-center items-center text-center"
              >
                <span className="text-3xl sm:text-4xl font-mono font-bold text-white mb-2">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-mono text-gray-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Core Values Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreValues.map((value, i) => (
            <div
              key={i}
              className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group"
            >
              {/* Decorative accent border on hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-purple/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

              <div className="p-3 bg-white/5 rounded-xl w-fit">
                {value.icon}
              </div>
              <h4 className="text-lg sm:text-xl font-semibold text-white">
                {value.title}
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

