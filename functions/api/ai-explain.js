// Cloudflare Pages Function — /api/ai-explain
//
// Powers two in-app AI features for Expedition 11:
//   mode "mistake" -> AI Mistake Coach (explains a wrong Mistake Bank answer)
//   mode "doubt"   -> AI Doubt Solver (freeform question chat + OCR solve)
//
// Requires the "AI" binding enabled on this Cloudflare Pages project.
// Variable name must be exactly:  AI
//
// Deploy steps:
//   1. Push this file to your repo under functions/api/ai-explain.js
//   2. Cloudflare Pages dashboard → Settings → Functions → Workers AI Bindings
//      → Add binding → Variable name: AI
//   3. Trigger a new deployment (push a commit or click Retry deploy)

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

const TUTOR_VOICE =
  'You are a friendly, sharp tutor for Indian Class 11 JEE aspirants (Math, ' +
  'Physics, Chemistry). Explain clearly and concisely, plain text only ' +
  '(no markdown headers or bullet symbols), like a good teacher talking ' +
  'to a student — never condescending, never padded with fluff.';

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers so the browser fetch from index.html is allowed
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (!env.AI) {
    return new Response(
      JSON.stringify({ error: 'AI binding not configured on this Pages project yet. See functions/api/ai-explain.js for setup steps.' }),
      { status: 500, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Malformed request.' }), { status: 400, headers: corsHeaders });
  }

  const mode = body.mode === 'mistake' ? 'mistake' : 'doubt';
  let messages;

  if (mode === 'mistake') {
    const { question, options, correctAnswer, userAnswer, subject, chapter } = body;
    if (!question || !Array.isArray(options)) {
      return new Response(JSON.stringify({ error: 'Missing question/options for mistake explanation.' }), { status: 400, headers: corsHeaders });
    }
    const optsList = options.map((o, i) => `${i}: ${o}`).join('\n');
    messages = [
      { role: 'system', content: TUTOR_VOICE + ' Keep the explanation under 120 words.' },
      {
        role: 'user',
        content:
          `Subject: ${subject || 'N/A'}\nChapter: ${chapter || 'N/A'}\n\n` +
          `Question: ${question}\n\nOptions:\n${optsList}\n\n` +
          `Correct answer: ${options[correctAnswer]}\n` +
          `Student's answer: ${options[userAnswer]}\n\n` +
          `Explain why the correct answer is right and, briefly, why the ` +
          `student's choice is a common mistake here.`
      }
    ];
  } else {
    // mode === 'doubt'  (also used by OCR Scan & Solve)
    const { question } = body;
    if (!question || !question.trim()) {
      return new Response(JSON.stringify({ error: 'No question provided.' }), { status: 400, headers: corsHeaders });
    }
    messages = [
      { role: 'system', content: TUTOR_VOICE + ' Keep the answer under 150 words unless a worked example genuinely needs more room.' },
      { role: 'user', content: question.trim().slice(0, 2000) }
    ];
  }

  try {
    const aiResp = await env.AI.run(MODEL, { messages });
    const answer = aiResp?.response || aiResp?.result?.response || '';
    if (!answer) {
      return new Response(JSON.stringify({ error: 'AI returned an empty response — try rephrasing.' }), { status: 502, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ answer }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'AI request failed — ' + (e?.message || 'unknown error') }),
      { status: 502, headers: corsHeaders }
    );
  }
}
