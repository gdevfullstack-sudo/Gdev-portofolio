import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import TerminalConsole from "@/components/TerminalConsole";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#030712] text-gray-100 selection:bg-accent-purple/30 selection:text-white">
      {/* Structural Components */}
      <Navbar />
      
      <main className="flex-grow">
        {/* Sections */}
        <Hero />
        <About />
        <Projects />
        <Skills />
        <TerminalConsole />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

