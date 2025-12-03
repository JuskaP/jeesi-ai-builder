import { motion } from "framer-motion";

const founders = [
  { name: "Sarah", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face" },
  { name: "Marcus", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face" },
  { name: "Elena", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=80&h=80&fit=crop&crop=face" },
  { name: "James", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face" },
  { name: "Maya", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face" },
  { name: "David", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
  { name: "Sophie", image: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=80&h=80&fit=crop&crop=face" },
  { name: "Alex", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Rachel", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face" },
  { name: "Tom", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face" },
  { name: "Nina", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
  { name: "Chris", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" },
  { name: "Laura", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { name: "Michael", image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=face" },
  { name: "Emma", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { name: "Robert", image: "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=80&h=80&fit=crop&crop=face" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

export default function FoundersCommunity() {
  const topRow = founders.slice(0, 8);
  const bottomRow = founders.slice(8, 16);

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16 text-center relative z-10">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
      >
        Join worldwide community of founders and entrepreneurs who use Jeesi.ai to level up their businesses!
      </motion.h2>
      
      <div className="flex flex-col items-center gap-3 md:gap-4">
        {/* Top Row */}
        <motion.div 
          className="flex flex-wrap justify-center items-center gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {topRow.map((founder, index) => (
            <motion.div
              key={founder.name}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.15, 
                zIndex: 10,
                transition: { duration: 0.2 }
              }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: [0, index % 2 === 0 ? -4 : 4, 0],
                }}
                transition={{
                  duration: 2 + (index * 0.2),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={founder.image}
                  alt={`${founder.name} - Jeesi.ai community member`}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-border shadow-lg hover:border-primary hover:shadow-primary/20 hover:shadow-xl transition-all duration-300"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Row - Offset */}
        <motion.div 
          className="flex flex-wrap justify-center items-center gap-3 md:gap-4 translate-x-6 md:translate-x-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {bottomRow.map((founder, index) => (
            <motion.div
              key={founder.name}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.15, 
                zIndex: 10,
                transition: { duration: 0.2 }
              }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: [0, index % 2 === 0 ? 4 : -4, 0],
                }}
                transition={{
                  duration: 2.5 + (index * 0.2),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={founder.image}
                  alt={`${founder.name} - Jeesi.ai community member`}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-border shadow-lg hover:border-primary hover:shadow-primary/20 hover:shadow-xl transition-all duration-300"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
