import { motion } from "framer-motion";
import { Zap, Code2, Puzzle, Shield, Sparkles, Rocket } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Nopea käyttöönotto",
    description: "Luo toimiva AI-agentti minuuteissa, ei tunteja tai päiviä. Kerro mitä haluat ja alusta hoitaa loput."
  },
  {
    icon: Code2,
    title: "Ei koodausta",
    description: "Ei tarvitse teknistä osaamista. Keskustele assistentin kanssa luonnollisella kielellä ja rakennetaan yhdessä."
  },
  {
    icon: Puzzle,
    title: "Valmis integroitavaksi",
    description: "Upota agentit suoraan verkkosivuille, sovelluksiin tai käytä API:n kautta. Toimii heti."
  },
  {
    icon: Shield,
    title: "Turvallinen ja luotettava",
    description: "Tietosi on turvassa. GDPR-yhteensopiva alusta suomalaisella tuella ja ylläpidolla."
  },
  {
    icon: Sparkles,
    title: "Tekoälyn voima",
    description: "Hyödyntää kehittyneitä kielimalleja ymmärtääkseen asiakkaitasi ja auttaakseen heitä paremmin."
  },
  {
    icon: Rocket,
    title: "Skaalautuva ratkaisu",
    description: "Aloita pienellä ja kasvata tarpeen mukaan. Ei kiinteitä kustannuksia, maksa vain käytöstä."
  }
];

export default function Features() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Miksi Jeesi.ai?
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Kaikki mitä tarvitset AI-agenttien rakentamiseen ja käyttöönottoon
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-card border border-border rounded-xl p-6 h-full hover:shadow-lg transition-all duration-300">
              <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
