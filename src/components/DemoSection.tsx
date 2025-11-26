import { motion } from "framer-motion";
import { MessageSquare, Cpu, TestTube, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "1. Kerro tarpeesi",
    description: "Kuvaile mitä haluat agentin tekevän - käytä ääntä tai tekstiä",
  },
  {
    icon: Cpu,
    title: "2. AI rakentaa",
    description: "Tekoäly luo agentin automaattisesti perustuen kuvaukseen",
  },
  {
    icon: TestTube,
    title: "3. Testaa ja muokkaa",
    description: "Kokeile agenttia ja tee tarvittavat muutokset keskustelemalla",
  },
  {
    icon: Rocket,
    title: "4. Julkaise",
    description: "Julkaise agentti verkkosivulle tai integroituna järjestelmiin",
  },
];

export default function DemoSection() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 my-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Näin helppoa agentin luominen on
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Neljä yksinkertaista vaihetta ideasta toimivaan AI-agenttiin
        </p>
      </motion.div>

      <div className="relative">
        {/* Connection line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2" />
        
        <div className="grid md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                  {/* Step number badge */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm text-center">
                    {step.description}
                  </p>
                </div>

                {/* Arrow between steps (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 text-primary/40 z-10">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center mt-12"
      >
        <p className="text-muted-foreground mb-6">
          Koko prosessi keskimäärin alle 5 minuuttia
        </p>
        <a
          href="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
        >
          Kokeile nyt ilmaiseksi
        </a>
      </motion.div>
    </section>
  );
}
