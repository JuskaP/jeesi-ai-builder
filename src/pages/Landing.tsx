import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import ChatUI from "@/components/ChatUI";
import UseCaseCarousel from "@/components/UseCaseCarousel";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";

export default function Landing() {
  const location = useLocation();
  const template = location.state?.template;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50 flex flex-col items-center px-4 py-6 relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-5xl lg:text-6xl font-bold text-center mt-24 md:mt-28 text-foreground relative z-10 max-w-4xl px-4"
      >
        Luo henkilökohtainen apurisi nopeasti ja helposti!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-muted-foreground text-base md:text-lg lg:text-xl text-center mt-4 md:mt-6 max-w-2xl relative z-10 px-4"
      >
        Jeesi.io tekee AI-agenttien käyttöönotosta yhtä helppoa kuin viestien lähettämisestä. 
        Kerro assistentille mitä haluat agentin tekevän ja alusta hoitaa loput!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-3xl mt-8 md:mt-12 relative z-10 px-4"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 rounded-xl blur-xl" />
          <div className="relative">
            <ChatUI template={template} />
          </div>
        </div>
      </motion.div>

      <UseCaseCarousel />

      <Features />

      <Testimonials />

      <FAQ />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="mt-12 mb-16 text-center relative z-10"
      >
        <a 
          href="/auth" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
        >
          <span>Aloita ilmaiseksi</span>
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </a>
      </motion.div>
    </div>
  );
}
