import { motion } from "framer-motion";
import { Shield, Lock, MapPin, FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TrustBadges() {
  const { t } = useTranslation();

  const badges = [
    {
      icon: Shield,
      titleKey: "trust.gdpr.title",
      descriptionKey: "trust.gdpr.description",
    },
    {
      icon: Lock,
      titleKey: "trust.ssl.title",
      descriptionKey: "trust.ssl.description",
    },
    {
      icon: MapPin,
      titleKey: "trust.euResidency.title",
      descriptionKey: "trust.euResidency.description",
    },
    {
      icon: FileCheck,
      titleKey: "trust.iso27001.title",
      descriptionKey: "trust.iso27001.description",
    },
  ];

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
          {t('trust.title')}
        </h2>
        <p className="text-muted-foreground text-lg">
          {t('trust.subtitle')}
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
              key={index}
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
                {t(badge.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(badge.descriptionKey)}
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
          {t('trust.commitment')}
        </p>
      </motion.div>
    </section>
  );
}
