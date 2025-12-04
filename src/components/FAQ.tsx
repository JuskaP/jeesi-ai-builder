import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { getFAQSchema } from "@/hooks/useSEO";

export default function FAQ() {
  const { t } = useTranslation();

  const faqs = [
    { questionKey: "faq.q1", answerKey: "faq.a1" },
    { questionKey: "faq.q2", answerKey: "faq.a2" },
    { questionKey: "faq.q3", answerKey: "faq.a3" },
    { questionKey: "faq.q4", answerKey: "faq.a4" },
    { questionKey: "faq.q5", answerKey: "faq.a5" },
    { questionKey: "faq.q6", answerKey: "faq.a6" },
    { questionKey: "faq.q7", answerKey: "faq.a7" },
    { questionKey: "faq.q8", answerKey: "faq.a8" },
    { questionKey: "faq.q9", answerKey: "faq.a9" },
    { questionKey: "faq.q10", answerKey: "faq.a10" },
  ];

  // Add FAQ structured data for SEO
  useEffect(() => {
    const faqData = faqs.map(faq => ({
      question: t(faq.questionKey),
      answer: t(faq.answerKey),
    }));
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'faq-schema');
    script.textContent = JSON.stringify(getFAQSchema(faqData));
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[data-seo="faq-schema"]');
      if (existingScript) existingScript.remove();
    };
  }, [t]);

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {t('faq.title')}
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl">
          {t('faq.subtitle')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {t(faq.questionKey)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(faq.answerKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-12 text-center"
      >
        <p className="text-muted-foreground mb-4">
          {t('faq.noAnswer')}
        </p>
        <a 
          href="/auth" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
        >
          {t('faq.contactUs')}
        </a>
      </motion.div>
    </section>
  );
}
