import { motion } from "framer-motion";

const founders = [
  { name: "Sarah", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { name: "Michael", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Emma", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { name: "James", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
  { name: "Lisa", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { name: "David", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" },
  { name: "Anna", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face" },
  { name: "Robert", image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face" },
];

export default function FoundersCommunity() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto px-4 py-16 text-center relative z-10"
    >
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
        Join worldwide community of founders and entrepreneurs who use Jeesi.ai to level up their businesses!
      </h2>
      
      <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
        {founders.map((founder, index) => (
          <motion.div
            key={founder.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="relative group"
          >
            <img
              src={founder.image}
              alt={`${founder.name} - Jeesi.ai founder`}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-border hover:border-primary transition-all duration-300 hover:scale-110"
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
