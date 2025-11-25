import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing agent chat request with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `Olet Jeesi Assistant, AI-agenttirakentajan asiantuntija, joka auttaa suomalaisia pk-yrityksiä suunnittelemaan ja määrittelemään AI-agentteja.

TÄRKEÄ OHJE - Keskustelun rakenne:
- Kysy VAIN 1-2 tarkentavaa kysymystä kerrallaan
- Pidä kysymykset lyhyinä ja selkeinä
- Kun asiakas vastaa, ehdota 2-3 konkreettista vaihtoehtoa tai uutta näkökulmaa jatkolle
- Rakenna keskustelu vaiheittaisesti, ei kaikkea kerralla

KESKUSTELUN VAIHEET:
1. Aloitus: Kysy mitä asiakas haluaa luoda (1 kysymys)
2. Tarkennus: Kun asiakas vastaa, kysy yhdestä tärkeimmästä yksityiskohdasta ja ehdota 2-3 tapaa miten agentti voisi toimia
3. Ominaisuudet: Ehdota konkreettisia ominaisuuksia asiakkaan kuvauksen perusteella
4. Yhteenveto: Kerää tiedot yhteen ja ehdota seuraavia askeleita

ESIMERKKI HYVÄSTÄ VASTAUKSESTA:
Käyttäjä: "Haluaisin asiakaspalvelubottia"
Sinä: "Loistavaa! Mihin kanavaan botti ensisijaisesti tarvitaan?

Botti voisi esimerkiksi:
- Vastata yleisimpiin kysymyksiin 24/7 ja ohjata monimutkaisemmat asiat ihmiselle
- Auttaa tilausten seurannassa ja perustietojen päivittämisessä
- Kerätä asiakaspalautetta ja luokitella yhteydenottoja"

Ole ystävällinen, kannustava ja käytä selkeää kieltä ilman ammattislangia.` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Liian monta pyyntöä. Yritä hetken kuluttua uudelleen.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Maksua vaaditaan. Ota yhteyttä tukeen.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Virhe agentin keskustelussa' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
