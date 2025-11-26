import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTABanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-6xl mx-auto px-4 my-24 relative z-10"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/20 rounded-2xl blur-2xl" />
        <div className="relative bg-gradient-to-br from-primary/10 via-background/50 to-accent/10 backdrop-blur-sm border border-border/50 rounded-2xl p-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ilmainen kokeilujakso</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Aloita AI-agenttisi luominen tänään
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Ei sitoutumista, ei luottokorttia. Kokeile ilmaiseksi ja näe miten helppoa agentin luominen voi olla.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 group"
            >
              <span>Aloita ilmaiseksi</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            
            <span className="text-sm text-muted-foreground">
              ✓ Ei luottokorttia tarvita
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>5 minuuttia käyttöönottoon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Ei teknistä osaamista tarvita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Tuki suomeksi</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
