import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const useCases = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    title: 'Asiakaspalvelu',
    description: 'Automatisoi asiakaspalvelu 24/7 ja vastaa kysymyksiin välittömästi.'
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Myynti & Markkinointi',
    description: 'Luo personoituja kampanjoita ja seuraa tuloksia reaaliajassa.'
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Ajanvaraus',
    description: 'Hallinnoi tapaamisia ja muistutuksia automaattisesti.'
  }
];

export default function UseCaseCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledUseCases, setShuffledUseCases] = useState(useCases);

  useEffect(() => {
    // Shuffle use cases on mount
    const shuffled = [...useCases].sort(() => Math.random() - 0.5);
    setShuffledUseCases(shuffled);
  }, []);

  useEffect(() => {
    // Change use case every 10 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % shuffledUseCases.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [shuffledUseCases.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="mt-16 md:mt-24 w-full max-w-5xl relative z-10 px-4"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {shuffledUseCases.map((useCase, index) => (
          <AnimatePresence key={index} mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: currentIndex === index ? 1.05 : 1,
                y: currentIndex === index ? -8 : 0
              }}
              transition={{ duration: 0.5 }}
              className={`group p-6 rounded-xl bg-card/50 backdrop-blur-sm border transition-all duration-500 ${
                currentIndex === index 
                  ? 'border-primary shadow-lg shadow-primary/20' 
                  : 'border-border/50 hover:border-primary/50'
              } hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-500 ${
                currentIndex === index 
                  ? 'bg-primary/20 scale-110' 
                  : 'bg-primary/10 group-hover:bg-primary/20'
              }`}>
                {useCase.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground">{useCase.description}</p>
              {currentIndex === index && (
                <motion.div
                  key={`progress-${currentIndex}`}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                  className="h-1 bg-primary/50 rounded-full mt-4"
                />
              )}
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
    </motion.div>
  );
}
