import { motion } from "framer-motion";
import { Shield, Lock, MapPin, FileCheck } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "GDPR-yhteensopiva",
    description: "Täysi vaatimustenmukaisuus EU:n tietosuoja-asetuksen kanssa",
  },
  {
    icon: Lock,
    title: "SSL/TLS-suojattu",
    description: "Kaikki data salattu korkeimman tason salauksella",
  },
  {
    icon: MapPin,
    title: "Suomalainen palvelu",
    description: "Data säilytetään Suomessa ja EU:ssa",
  },
  {
    icon: FileCheck,
    title: "ISO 27001",
    description: "Sertifioitu tietoturvanhallintajärjestelmä",
  },
];

export default function TrustBadges() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 my-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Luotettavuus ja tietoturva
        </h2>
        <p className="text-muted-foreground text-lg">
          Tietosi on turvassa korkealaatuisten standardien mukaisesti
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/20 transition-all duration-300 hover:shadow-md"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {badge.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {badge.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center mt-8"
      >
        <p className="text-sm text-muted-foreground">
          Sitoudumme korkeimpiin tietoturva- ja yksityisyysstandardeihin suojataksemme tietosi
        </p>
      </motion.div>
    </section>
  );
}
