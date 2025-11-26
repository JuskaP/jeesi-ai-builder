import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Virtanen",
    role: "Toimitusjohtaja, Verkkokauppa Oy",
    content: "Jeesi.ai auttoi meitä automatisoimaan asiakaspalvelun ilman teknistä osaamista. Säästimme 40% ajasta ja asiakkaat ovat tyytyväisempiä.",
    rating: 5,
    image: "MV"
  },
  {
    name: "Jukka Mäkinen",
    role: "Markkinointipäällikkö, Digi Solutions",
    content: "Loimme lead-generointiin agentin alle tunnissa. Ei ollut koskaan helpompaa! Suosittelen lämpimästi kaikille pk-yrityksille.",
    rating: 5,
    image: "JM"
  },
  {
    name: "Sanna Korhonen",
    role: "Perustaja, Wellness Studio",
    content: "Ajanvarausagenttimme toimii 24/7 ja varaukset ovat kasvaneet 60%. Asiakkaat rakastavat sitä ja me myös!",
    rating: 5,
    image: "SK"
  }
];

export default function Testimonials() {
  return (
    <section className="w-full bg-muted/30 py-16 md:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Mitä asiakkaamme sanovat
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Tuhannet yritykset luottavat Jeesi.ai:hin päivittäin
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-xl p-6 h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
