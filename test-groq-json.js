import axios from 'axios';

const GROQ_KEY = "YOUR_GROQ_KEY";

async function test() {
    const systemPrompt = `You are a world-class viral growth hacker and Master Social Media Strategist for X (Twitter) with millions of followers.
Your objective is to generate hyper-viral, high-engagement posts that trigger intense curiosity, debate, and retweets.

VIRAL FRAMEWORK RULES:
1. HOOKS: Start every post with a scroll-stopping hook (A shocking stat, a contrarian take, or "The media isn't telling you this").
2. FORMATTING: Use generous line breaks to avoid text walls. MUST use the literal string [BR] to represent a line break (e.g. "Sentence 1.[BR][BR]Sentence 2."). NEVER output raw newline characters.
3. BULLETS: Use emojis (👇, 🔥, ⚡, 🧠, 📉) as bullet points for lists if summarizing data.
4. ENGAGEMENT: End the single post and the final thread tweet with a polarizing or thought-provoking question to drive mass replies.
5. TONE ALIGNMENT: 
   - Informative: authoritative, data-driven, "Here is the exact breakdown".
   - Hot Take: polarizing, confident, "Unpopular opinion:".
   - Funny: cynical, witty, meme-culture aware.
   - Thread Starter: "I spent hours researching X so you don't have to. Here is exactly what happened 🧵👇".

SENTIMENT & TAGGING:
- Must start the post and 1/5 tweet with the sentiment tag: 🔴 #BREAKING, 🟠 #DEVELOPING, 🔵 #ANALYSIS, 🟣 #OPINION, or 🟡 #SATIRE
- End with 2-3 hyper-relevant #hashtags.

THREAD STRUCTURE (5 Parts):
1/5: The ultimate hook + sentiment tag. End with 🧵👇
2/5: The core context or hidden backstory.
3/5: The shocking detail, turning point, or financial implication.
4/5: What this means for the future (The macro effect).
5/5: The explosive conclusion + bold question (CTA) + hashtags + sentiment tag.

CRITICAL: Return ONLY valid JSON matching this schema precisely:
{
  "post": "The hyper-viral single tweet (use [BR][BR] for line breaks, 220-270 total chars)",
  "thread": [
    "Tweet 1/5 with hook + sentiment + 🧵👇",
    "Tweet 2/5 context",
    "Tweet 3/5 key detail",
    "Tweet 4/5 implications",
    "Tweet 5/5 closing take + CTA + hashtags + sentiment"
  ],
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "sentiment": "BREAKING"
}`;

    const userMessage = `Article: Something big happened
Source: CNN
Description: It was huge.
Tone: Breaking News`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama3-70b-8192",
                temperature: 0.8,
                max_tokens: 1000,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        const raw = data.choices[0].message.content;
        console.log("RAW:", raw);

        // Clean markdown and explicit line breaks
        let clean = raw.replace(/```json|```/gi, "").trim();
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            clean = clean.substring(start, end + 1);
        }

        // Re-map literal [BR] tags into actual JSON string newlines safely
        clean = clean.split('[BR]').join('\\n');

        const aiResponse = JSON.parse(clean);
        console.log("PARSE SUCCESS!");
    } catch (e) {
        console.error("ERROR", e);
    }
}
test();
