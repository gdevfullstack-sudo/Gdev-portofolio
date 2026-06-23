"use client";

import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormState>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validate = (): boolean => {
    const tempErrors: FormErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Le nom est requis.";
    if (!formData.email.trim()) {
      tempErrors.email = "L'adresse e-mail est requise.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "L'adresse e-mail est invalide.";
    }
    if (!formData.message.trim()) tempErrors.message = "Le message ne peut pas être vide.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Option: parser message d’erreur
        setErrors((prev) => ({ ...prev, message: "Une erreur est survenue lors de l'envoi." }));
        return;
      }

      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch {
      setErrors((prev) => ({ ...prev, message: "Une erreur réseau est survenue." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#030712]/50 relative border-t border-white/5 bg-grid-pattern">
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="flex flex-col mb-16 items-center text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-purple mb-2">
            05 / Collaboration
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Travaillons ensemble
          </h2>
          <div className="h-1 w-20 bg-accent-purple mt-3 rounded" />
          <p className="max-w-md text-gray-400 text-sm sm:text-base mt-6">
            Une idée de projet, une offre d&apos;emploi ou simplement envie de discuter ? Envoyez-moi un message !
          </p>
        </div>

        {/* Contact Form Panel */}
        <div className="glass-panel p-8 sm:p-12 rounded-3xl max-w-2xl mx-auto relative overflow-hidden">
          {submitSuccess && (
            <div className="absolute inset-0 bg-gray-950/95 backdrop-blur-md flex flex-col justify-center items-center text-center p-6 z-30 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Message envoyé avec succès !</h3>
              <p className="text-gray-400 text-sm max-w-sm">
                Merci pour votre intérêt. Je prendrai connaissance de votre message et je vous répondrai dans les plus brefs délais.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-sm text-white placeholder-gray-500 transition-all outline-none ${
                  errors.name
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-accent-purple focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                }`}
                placeholder="Ex. Jean Dupont"
              />
              {errors.name && <span className="text-xs text-red-400 font-mono mt-1">{errors.name}</span>}
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">
                Adresse e-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-sm text-white placeholder-gray-500 transition-all outline-none ${
                  errors.email
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-accent-purple focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                }`}
                placeholder="jean.dupont@example.com"
              />
              {errors.email && <span className="text-xs text-red-400 font-mono mt-1">{errors.email}</span>}
            </div>

            {/* Message Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border text-sm text-white placeholder-gray-500 transition-all outline-none resize-none ${
                  errors.message
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-accent-purple focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                }`}
                placeholder="Parlez-moi de votre projet en détail..."
              />
              {errors.message && <span className="text-xs text-red-400 font-mono mt-1">{errors.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-accent-purple hover:bg-violet-600 disabled:bg-accent-purple/50 text-white font-medium text-sm transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer le message
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}

