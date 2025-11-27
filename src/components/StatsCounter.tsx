import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Bot, Clock } from 'lucide-react';

const stats = [
  { 
    icon: Users, 
    value: 2500, 
    suffix: '+', 
    label: 'Tyytyväistä käyttäjää',
    color: 'from-primary/20 to-primary/5'
  },
  { 
    icon: Bot, 
    value: 5000, 
    suffix: '+', 
    label: 'Luotua agenttia',
    color: 'from-accent/20 to-accent/5'
  },
  { 
    icon: Clock, 
    value: 50000, 
    suffix: '+', 
    label: 'Säästettyä työtuntia',
    color: 'from-primary/15 to-primary/5'
  },
];

function useCountUp(end: number, duration: number, shouldStart: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, shouldStart]);

  return count;
}

export default function StatsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="mt-16 md:mt-24 w-full max-w-6xl relative z-10 px-4"
    >
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const count = useCountUp(stat.value, 2000, isInView);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Number */}
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 tabular-nums">
                    {count.toLocaleString('fi-FI')}{stat.suffix}
                  </div>
                  
                  {/* Label */}
                  <p className="text-sm md:text-base text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
