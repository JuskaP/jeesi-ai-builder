import { motion } from "framer-motion";
import { Slack, Chrome, Mail, Zap, ShoppingBag, MessageCircle, Cloud, Database } from "lucide-react";

const integrations = [
  { name: "Slack", Icon: Slack },
  { name: "Google", Icon: Chrome },
  { name: "Email", Icon: Mail },
  { name: "Zapier", Icon: Zap },
  { name: "Shopify", Icon: ShoppingBag },
  { name: "WhatsApp", Icon: MessageCircle },
  { name: "Cloud Storage", Icon: Cloud },
  { name: "Databases", Icon: Database },
];

export default function Integrations() {
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
          Yhteensopiva suosituimpien työkalujen kanssa
        </h2>
        <p className="text-muted-foreground text-lg">
          Integroidu saumattomasti olemassa oleviin järjestelmiisi
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {integrations.map((integration, index) => {
          const Icon = integration.Icon;
          return (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
            >
              <Icon className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <span className="mt-3 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {integration.name}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        Ja satoja muita integraatioita API:n kautta
      </motion.p>
    </section>
  );
}
