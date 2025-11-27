import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Tarvitseeko minun osata koodata?",
    answer: "Ei! Jeesi.ai on suunniteltu nimenomaan ei-teknisille käyttäjille. Keskustelet yksinkertaisesti assistentin kanssa luonnollisella kielellä, ja se rakentaa agentin puolestasi."
  },
  {
    question: "Kuinka kauan agentin luominen kestää?",
    answer: "Yksinkertaisen agentin voit luoda jo muutamassa minuutissa. Monimutkaisemmat agentit voivat vaatia 15-30 minuuttia. Kaikki riippuu tarpeistasi ja halutusta toiminnallisuudesta."
  },
  {
    question: "Mitä ovat krediitit ja miten niitä käytetään?",
    answer: "Krediitit ovat Jeesi.ai:n käyttöyksikkö. Jokainen agentin luonti, muokkaus tai keskustelu assistentin kanssa kuluttaa krediittejä. Ilmaisessa Basic-tasossa saat 5 päivittäistä krediittiä (max 50/kk). Pro-tasossa saat 5 päivittäistä + 150 kuukausikrediittiä, ja Expert-tasossa 250 krediittiä kuukaudessa."
  },
  {
    question: "Miten hinnoittelu toimii?",
    answer: "Tarjoamme neljä tasoa: Basic (ilmainen, 50 krediittiä/kk), Pro (29,99€/kk, 155 krediittiä/kk), Expert (49,99€/kk, 250 krediittiä/kk) ja Custom (räätälöity hinnoittelu). Pro ja Expert -tilaajat voivat ostaa lisää krediittejä tarpeen mukaan: 50 krediittiä 9,99€, 100 krediittiä 14,99€, 200 krediittiä erikoishinnoittelulla."
  },
  {
    question: "Voiko krediittejä ostaa lisää?",
    answer: "Kyllä! Pro ja Expert -tason käyttäjät voivat ostaa lisäkrediittejä milloin tahansa: 50 krediittiä 9,99€, 100 krediittiä 14,99€ tai 200 krediittiä. Ostamasi krediitit säilyvät ja siirtyvät seuraavaan kuukauteen, joten ne eivät vanhene."
  },
  {
    question: "Mitä tapahtuu käyttämättömille krediiteille?",
    answer: "Pro ja Expert -tason kuukausittaiset krediitit siirtyvät seuraavalle kuukaudelle, joten et menetä niitä! Päivittäiset ilmaiskrediitit (5 per päivä) eivät kuitenkaan kerry, vaan ne ovat käytettävissä päivittäin. Basic-tason päivittäiset krediitit on rajoitettu 50 krediittiin kuukaudessa."
  },
  {
    question: "Voiko agentin integroida olemassa oleviin järjestelmiin?",
    answer: "Kyllä! Agentit voidaan upottaa verkkosivuille, integroida API:n kautta tai liittää olemassa oleviin työkaluihin. Tuemme yleisimpiä integrointeja heti valmiina. Huomaa, että agentin julkaisu ja integrointi vaativat Pro-tason tai korkeamman tilauksen."
  },
  {
    question: "Voinko vaihtaa tilaustasoa myöhemmin?",
    answer: "Kyllä voit! Voit päivittää tilauksesi milloin tahansa korkeammalle tasolle, ja muutos tulee voimaan välittömästi. Alentaminen alemmalle tasolle tulee voimaan seuraavan laskutusjakson alussa. Kaikki ostamasi lisäkrediitit säilyvät tilauksen muutoksessa."
  },
  {
    question: "Onko tietoni turvassa?",
    answer: "Ehdottomasti. Olemme GDPR-yhteensopivia ja kaikki data on salattua. Suomalainen palvelu, suomalainen tuki, ja sinulla on täysi kontrolli datasi suhteen."
  },
  {
    question: "Mitä jos tarvitsen apua?",
    answer: "Tarjoamme suomenkielisen asiakastuen suoraan chatissa tai sähköpostitse. Lisäksi meillä on kattava dokumentaatio ja videooppaat, jotka auttavat pääsemään alkuun."
  }
];

export default function FAQ() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Usein kysytyt kysymykset
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl">
          Vastaukset yleisimpiin kysymyksiin
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
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
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
          Eikö vastausta löytynyt?
        </p>
        <a 
          href="/auth" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
        >
          Ota yhteyttä
        </a>
      </motion.div>
    </section>
  );
}
