import { motion } from "framer-motion";
import ChatUI from "@/components/ChatUI";

export default function Landing() {
  return (
    <div className="min-h-screen bg-muted/50 flex flex-col items-center p-6 relative">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold text-center mt-10 text-foreground"
      >
        Rakenna AI Agentti<br />Minuuteissa
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-lg md:text-2xl text-center mt-4 max-w-2xl"
      >
        Jeesi.io tekee AI-ratkaisujen käyttöönotosta yhtä helppoa kuin viestin lähettämisestä.
        Aloita keskustelemalla — alusta hoitaa loput.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl mt-10"
      >
        <ChatUI />
      </motion.div>

      <div className="mt-6 text-center text-muted-foreground">
        Ei vaadi kirjautumista aloittamiseen.
      </div>
    </div>
  );
}
