import { motion } from "framer-motion";
import { Zap, Code2, Puzzle, Shield, Sparkles, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Zap,
      titleKey: "features.quickSetup.title",
      descriptionKey: "features.quickSetup.description"
    },
    {
      icon: Code2,
      titleKey: "features.noCoding.title",
      descriptionKey: "features.noCoding.description"
    },
    {
      icon: Puzzle,
      titleKey: "features.readyToIntegrate.title",
      descriptionKey: "features.readyToIntegrate.description"
    },
    {
      icon: Shield,
      titleKey: "features.secureReliable.title",
      descriptionKey: "features.secureReliable.description"
    },
    {
      icon: Sparkles,
      titleKey: "features.aiPower.title",
      descriptionKey: "features.aiPower.description"
    },
    {
      icon: Rocket,
      titleKey: "features.scalableSolution.title",
      descriptionKey: "features.scalableSolution.description"
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {t('features.title')}
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          {t('features.subtitle')}
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
                {t(feature.titleKey)}
              </h3>
              <p className="text-muted-foreground">
                {t(feature.descriptionKey)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
