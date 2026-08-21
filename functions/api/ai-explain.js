// Cloudflare Pages Function — /api/ai-explain
//
// Powers two in-app AI features for Expedition 11:
//   mode "mistake" -> AI Mistake Coach (explains a wrong Mistake Bank answer)
//   mode "doubt"   -> AI Doubt Solver (freeform question chat)
//
// Runs on Cloudflare Workers AI, which is free-tier and requires no
// externally-managed API key — just the "AI" binding enabled on this
// Pages project (see README-AI-SETUP.md for the one-time setup step).
//
// A static site can never safely hold a real OpenAI/Anthropic key in its
// client-side JS (anyone can read it from view-source), so routing every
// AI call through this server-side function is what keeps this safe to
// ship publicly.

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

const TUTOR_VOICE =
  'You are a friendly, sharp tutor for Indian Class 11 JEE aspirants (Math, ' +
  'Physics, Chemistry). Explain clearly and concisely, plain text only ' +
  '(no markdown headers or bullet symbols), like a good teacher talking ' +
  'to a student — never condescending, never padded with fluff.';

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.AI) {
    return json(
      { error: 'AI binding not configured on this Pages project yet.' },
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Malformed request.' }, 400);
  }

  const mode = body.mode === 'mistake' ? 'mistake' : 'doubt';
  let messages;

  if (mode === 'mistake') {
    const { question, options, correctAnswer, userAnswer, subject, chapter } = body;
    if (!question || !Array.isArray(options)) {
      return json({ error: 'Missing question/options for mistake explanation.' }, 400);
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
    const { question } = body;
    if (!question || !question.trim()) {
      return json({ error: 'No question provided.' }, 400);
    }
    messages = [
      { role: 'system', content: TUTOR_VOICE + ' Keep the answer under 150 words unless a worked example genuinely needs more room.' },
      { role: 'user', content: question.trim().slice(0, 2000) }
    ];
  }

  try {
    const aiResp = await env.AI.run(MODEL, { messages });
    const answer = aiResp?.response || aiResp?.result?.response || '';
    if (!answer) return json({ error: 'AI returned an empty response — try rephrasing.' }, 502);
    return json({ answer });
  } catch (e) {
    return json({ error: 'AI request failed. Please try again in a moment.' }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
