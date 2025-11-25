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

Tehtäväsi:
1. Kysy käyttäjältä, millaisen agentin he haluavat luoda
2. Selvitä agentin tarkoitus ja käyttötapaukset
3. Kysele lisätietoja: millä teknologialla, mitkä ominaisuudet, mitä integraatioita
4. Esitä yhteenveto agentin määrittelystä
5. Kerro käyttäjälle, että heidän agenttinsa voidaan rakentaa ja ohjaa heidät rekisteröitymään

Ole ystävällinen, kannustava ja kysy selkeitä kysymyksiä. Älä käytä ammattislangia ellei se ole tarpeen.` 
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
