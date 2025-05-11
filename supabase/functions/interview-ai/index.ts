
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InterviewRequest {
  question: string;
  answer: string;
}

interface FeedbackResponse {
  score: number; // 1-10
  strengths: string[];
  areas_to_improve: string[];
  suggestions: string;
  overall_feedback: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error("OpenAI API key is missing");
    }

    const { question, answer } = await req.json() as InterviewRequest;

    if (!question || !answer) {
      throw new Error("Question and answer are required");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI interview coach. Analyze the candidate's answer to an interview question and provide structured feedback. 
            Format your response as a JSON object with the following fields:
            - score: a number from 1 to 10 rating the answer
            - strengths: an array of strengths in the answer (limit to 3)
            - areas_to_improve: an array of areas that could be improved (limit to 3)
            - suggestions: specific advice for improvement
            - overall_feedback: general feedback about the answer
            
            Your feedback should be constructive, insightful, and tailored to a job interview context.`
          },
          {
            role: 'user',
            content: `Interview Question: ${question}\n\nCandidate's Answer: ${answer}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Failed to get a response from OpenAI");
    }

    // Parse the feedback from the AI response
    const feedbackResponse = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ feedback: feedbackResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in interview-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
