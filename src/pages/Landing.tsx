import { motion } from "framer-motion";
import ChatUI from "@/components/ChatUI";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col items-center p-6 relative overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold text-center mt-20 text-foreground relative z-10 bg-clip-text"
      >
        Luo henkilökohtainen apurisi nopeasti ja helposti!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-lg md:text-2xl text-center mt-6 max-w-2xl relative z-10"
      >
        Jeesi.io tekee AI-agenttien käyttöönotosta yhtä helppoa kuin viestien lähettämisestä. 
        Kerro assistentille mitä haluat agentin tekevän ja alusta hoitaa loput!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-3xl mt-12 relative z-10"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg blur-lg" />
          <div className="relative">
            <ChatUI />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center relative z-10"
      >
        <a 
          href="/auth" 
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors inline-flex items-center gap-2 group"
        >
          <span>Kirjaudu tai luo tili</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </motion.div>
    </div>
  );
}
