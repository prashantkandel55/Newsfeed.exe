import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw,
    Copy,
    Check,
    Zap,
    ChevronDown,
    ExternalLink,
    AlertTriangle,
    X,
    Quote
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

// API KEYS
const GNEWS_KEY = "YOUR_GNEWS_KEY";
const GROQ_KEY = "YOUR_GROQ_KEY";

// CONFIG
const TOPICS = [
    { id: 'breaking', label: 'BREAKING' },
    { id: 'world', label: 'WORLD' },
    { id: 'technology', label: 'TECH' },
    { id: 'politics', label: 'POLITICS' },
    { id: 'hackernews', label: 'HACKER_NEWS' }
];

const TONES = [
    { id: 'Informative', label: 'Informative' },
    { id: 'Hot Take', label: 'Hot Take' },
    { id: 'Funny', label: 'Funny' },
    { id: 'Thread Starter', label: 'Thread Starter' }
];

const SENTIMENT_COLORS = {
    'BREAKING': 'text-[#ff4d6d] bg-[#ff4d6d12] border-[#ff4d6d40]',
    'DEVELOPING': 'text-[#fb923c] bg-[#fb923c12] border-[#fb923c40]',
    'ANALYSIS': 'text-[#60a5fa] bg-[#60a5fa12] border-[#60a5fa40]',
    'OPINION': 'text-[#c084fc] bg-[#c084fc12] border-[#c084fc40]',
    'SATIRE': 'text-[#facc15] bg-[#facc1512] border-[#facc1540]'
};

const SENTIMENT_HEX = {
    'BREAKING': '#ff4d6d',
    'DEVELOPING': '#fb923c',
    'ANALYSIS': '#60a5fa',
    'OPINION': '#c084fc',
    'SATIRE': '#facc15'
};

export default function App() {
    const [topic, setTopic] = useState('breaking');
    const [tone, setTone] = useState('Informative');
    const [cards, setCards] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const fetchNews = useCallback(async () => {
        setIsRefreshing(true);
        try {
            let initialCards = [];

            const getCardImage = (title, originalImage) => {
                if (originalImage) return originalImage;
                // Generate a stunning editorial concept image out of thin air using Pollinations AI
                const prompt = `Premium editorial news photography, dark mood, detailed, concept: ${title.replace(/[^a-zA-Z0-9 ]/g, '')}`;
                return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=400&nologo=true`;
            };

            if (topic === 'hackernews') {
                const hnResp = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
                const topIds = hnResp.data.slice(0, 10);
                const items = await Promise.all(topIds.map(id => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)));

                initialCards = items.map((res, idx) => ({
                    id: `hn-${idx}-${Date.now()}`,
                    article: {
                        title: res.data.title,
                        source: { name: 'Hacker News' },
                        description: `Type: ${res.data.type} | Score: ${res.data.score} | By: ${res.data.by}`,
                        url: res.data.url || `https://news.ycombinator.com/item?id=${res.data.id}`,
                        publishedAt: new Date(res.data.time * 1000).toISOString(),
                        image: getCardImage(res.data.title, null)
                    },
                    status: 'idle',
                    mode: 'single',
                    content: null,
                }));
            } else {
                const resp = await axios.get(`https://gnews.io/api/v4/top-headlines?token=${GNEWS_KEY}&lang=en&max=10&topic=${topic}`);
                initialCards = resp.data.articles.map((article, idx) => ({
                    id: `article-${idx}-${Date.now()}`,
                    article: {
                        ...article,
                        image: getCardImage(article.title, article.image)
                    },
                    status: 'idle',
                    mode: 'single',
                    content: null,
                }));
            }

            setCards(initialCards);

        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setIsRefreshing(false);
        }
    }, [topic, tone]);

    const generateAIContent = async (card) => {
        setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'loading', error: null } : c));

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

        // 1. Fetch semantic enhancement vocabulary from Datamuse API
        let powerWords = "";
        try {
            const datamuseResp = await axios.get(`https://api.datamuse.com/words?ml=${encodeURIComponent(topic)}&max=6`);
            if (datamuseResp.data && datamuseResp.data.length > 0) {
                powerWords = datamuseResp.data.map(w => w.word).join(", ");
            }
        } catch (e) {
            console.warn("Datamuse semantic fetch failed", e);
        }

        const userMessage = `Article: ${card.article.title}
Source: ${card.article.source.name}
Description: ${card.article.description}
Tone: ${tone}
${powerWords ? `Enhancement Rule: Subtly weave a couple of these high-impact semantic SEO words into the copy seamlessly: ${powerWords}` : ""}`;

        // 2. Fetch generating completion from Groq AI
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
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userMessage }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Groq HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const raw = data.choices[0].message.content;

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

            setCards(prev => prev.map(c => c.id === card.id ? { ...c, content: aiResponse, status: 'success', error: null } : c));
        } catch (err) {
            console.error("Groq error:", err);
            let errMsg = err.message;
            if (err.name === "SyntaxError") errMsg = "JSON Parse Error";
            setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'error', error: errMsg } : c));
        }
    };

    useEffect(() => {
        fetchNews();
    }, [topic]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handlePostToX = (text) => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    };

    const appendHashtag = (cardId, tag) => {
        setCards(prev => prev.map(c => {
            if (c.id === cardId && c.content && !c.content.post.includes(tag)) {
                return { ...c, content: { ...c.content, post: `${c.content.post} ${tag}` } };
            }
            return c;
        }));
    };

    return (
        <div className="min-h-screen relative font-sans">
            {/* Soft background bloom pattern */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #6366f115 0%, transparent 70%)'
            }} />

            {/* TOP NAV BAR */}
            <header className="fixed top-0 left-0 right-0 z-[110] bg-[#0c0c0fcc] backdrop-blur-[20px] border-b border-[#ffffff0a] h-[60px] px-6 flex items-center justify-between">

                {/* Left: Logo Area */}
                <div className="flex items-center gap-[6px]">
                    <Zap className="text-[var(--text-primary)]" size={14} fill="currentColor" />
                    <h1 className="text-[16px] font-sans font-bold text-[var(--text-primary)] flex items-baseline tracking-[0.15em] ml-1">
                        NEWSFEED
                        <span className="font-mono text-[var(--text-muted)] text-[14px] font-normal tracking-normal border-b border-[#6366f166] pb-[1px] ml-[2px]">.EXE</span>
                    </h1>
                    <div className="ml-4 flex items-center gap-1.5 opacity-90">
                        {/* Live indicator dot */}
                        <div className="relative flex items-center justify-center w-3 h-3">
                            <div className="absolute w-[6px] h-[6px] bg-[#22c55e] rounded-full" />
                            <div className="absolute w-[12px] h-[12px] rounded-full border-[1.5px] border-[#22c55e] live-ring" />
                        </div>
                        <span className="font-mono text-[10px] text-[#22c55e] font-medium tracking-wide">LIVE</span>
                    </div>
                </div>

                {/* Center: Topic Pills */}
                <div className="hidden md:flex items-center gap-1">
                    {TOPICS.map((t) => {
                        const isActive = topic === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTopic(t.id)}
                                className={cn(
                                    "font-sans text-[13px] font-medium rounded-[6px] px-[14px] py-[6px]  transition-all duration-150 cursor-pointer",
                                    isActive
                                        ? "bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-white shadow-[0_0_0_1px_#6366f1,0_0_12px_#6366f133]"
                                        : "bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-[#ffffff08] hover:text-[var(--text-secondary)]"
                                )}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[13px] px-[12px] py-[6px] pr-8 appearance-none cursor-pointer outline-none rounded-[6px] font-sans transition-colors"
                        >
                            {TONES.map(t => (
                                <option key={t.id} value={t.id} className="bg-[var(--bg-surface)]">{t.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                    </div>

                    <button
                        onClick={() => fetchNews()}
                        className="flex items-center gap-2 border border-[var(--border-default)] text-white px-[14px] py-[6px] rounded-[6px] font-sans text-[13px] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #1a1a2e, #13131a)' }}
                    >
                        <RefreshCw size={12} className={cn("text-[var(--text-secondary)]", isRefreshing && "animate-spin")} />
                        Sync
                    </button>
                </div>
            </header>

            {/* MAIN GRID */}
            <main className="max-w-[1400px] mx-auto px-[24px] pt-[84px] pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[#ffffff08]">
                    <AnimatePresence>
                        {cards.map((card, idx) => (
                            <NewsCard
                                key={card.id}
                                card={card}
                                idx={idx}
                                onRegenerate={() => generateAIContent(card)}
                                onCopy={handleCopy}
                                onPost={handlePostToX}
                                onAppendTag={appendHashtag}
                                copiedId={copiedId}
                                setCards={setCards}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function NewsCard({ card, idx, onRegenerate, onCopy, onPost, onAppendTag, copiedId, setCards }) {
    const { article, status = 'idle', content, mode, error } = card;

    const charCount = content?.post?.length || 0;
    const getCharColor = (count) => {
        if (count >= 275) return 'text-[var(--red)]';
        if (count >= 250) return 'text-[var(--yellow)]';
        return 'text-[var(--text-muted)]';
    };

    const sentiment = content?.sentiment || 'ANALYSIS';
    const hasImage = !!article.image;

    const sentimentColorHex = SENTIMENT_HEX[sentiment] || SENTIMENT_HEX['ANALYSIS'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.08 }}
            className="flex flex-col bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border-t-[3px] border-transparent transition-all duration-150 relative group"
            style={{
                borderTopColor: `${sentimentColorHex}${(status === 'loading' || status === 'idle') ? '4D' : 'B3'}`
            }}
        >
            {/* 1. IMAGE ZONE */}
            <div className="h-[260px] w-full overflow-hidden relative bg-[var(--bg-elevated)] shrink-0">
                {hasImage ? (
                    <>
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.04]"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 z-10 pointer-events-none" style={{
                            background: 'linear-gradient(to bottom, #00000044 0%, transparent 40%), linear-gradient(to top, #080810 0%, #08081088 50%, transparent 100%)'
                        }} />
                    </>
                ) : (
                    <div className="w-full h-[80px] bg-[var(--bg-elevated)] flex items-center justify-center">
                        <Quote size={32} className="text-[var(--text-muted)]" />
                    </div>
                )}

                {/* Source Badge overlay on image */}
                <div className="absolute top-4 left-4 z-20 font-mono text-[10px] tracking-[0.08em] bg-[#00000066] backdrop-blur-[10px] border border-[#ffffff15] rounded-[6px] px-[8px] py-[3px] text-white">
                    {article.source.name}
                </div>
                {/* Time Badge top-right */}
                <div className="absolute top-4 right-4 z-20 font-mono text-[10px] tracking-[0.08em] bg-[#00000066] backdrop-blur-[10px] border border-[#ffffff15] rounded-[6px] px-[8px] py-[3px] text-white">
                    {timeAgo(article.publishedAt)}
                </div>
            </div>

            {/* 2. SENTIMENT + HEADLINE ZONE */}
            <div className="p-[16px_20px_12px] flex flex-col items-start shrink-0">
                <div className={cn(
                    "font-mono text-[11px] font-medium tracking-[0.06em] rounded-[4px] px-[10px] py-[4px] border",
                    SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS['ANALYSIS']
                )}>
                    {/* Inner dot pulsing ONLY for breaking */}
                    <span className={cn(
                        "inline-block w-1.5 h-1.5 rounded-full mr-2 bg-current",
                        sentiment === 'BREAKING' && "dot-pulse-red"
                    )} />
                    {sentiment}
                </div>

                <h2 className="font-serif italic text-[1.35rem] leading-[1.4] text-[#f0f0f5] tracking-[-0.01em] mt-[8px] transition-colors duration-150 group-hover:text-[#ffffff]">
                    {article.title}
                </h2>

                <div className="font-mono text-[11px] text-[var(--text-muted)] mt-[6px]">
                    {article.source.name} · {timeAgo(article.publishedAt)}
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex align-middle hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                        ↗
                    </a>
                </div>
            </div>

            {/* GENERATE BUTTON / STATUS OVERRIDE */}
            <div className="px-[20px] pb-[16px] flex-1 flex flex-col justify-start">
                {status === 'idle' && (
                    <button
                        onClick={onRegenerate}
                        className="w-full bg-transparent border border-[#6366f144] rounded-[8px] p-[12px] text-[#6366f1] font-mono text-[12px] hover:bg-[#6366f110] hover:border-[#6366f188] hover:text-[#818cf8] transition-all duration-150 cursor-pointer flex justify-center items-center"
                    >
                        ⚡ Generate Post
                    </button>
                )}

                {status === 'loading' && (
                    <div className="w-full flex flex-col items-center justify-center py-4 gap-2">
                        <div className="h-[3px] w-full bg-[linear-gradient(90deg,transparent,#6366f1,transparent)] rounded-[2px]" style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.2s ease-in-out infinite' }} />
                        <span className="font-mono text-[11px] text-[#44445a]">generating with groq...</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-[#ff4d6d08] border border-[#ff4d6d22] border-l-[3px] border-l-[#ff4d6d] rounded-[8px] p-[14px_16px] flex flex-col items-start gap-3">
                        <div className="flex items-center gap-2 text-[#ff4d6d99] font-sans text-[13px] font-medium">
                            <AlertTriangle size={14} className="shrink-0" />
                            <span>Generation failed — {typeof error === 'string' ? error : 'model error'}</span>
                        </div>
                        <button onClick={onRegenerate} className="font-mono text-[11px] text-[#ff4d6d] border border-[#ff4d6d40] hover:bg-[#ff4d6d12] transition-colors px-[10px] py-[4px] rounded-[4px] cursor-pointer">
                            ↺ Retry
                        </button>
                    </div>
                )}
            </div>

            {/* LOADED ZONES */}
            {status === 'success' && content && (
                <div className="flex flex-col flex-1">

                    {/* 3. MODE TOGGLE */}
                    <div className="px-[20px] pb-[12px] shrink-0">
                        <div className="bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[6px] p-[3px] flex w-fit relative font-mono text-[11px]">
                            {/* Slide active BG logic */}
                            <div className="absolute top-[3px] bottom-[3px] w-[50%] bg-[var(--bg-overlay)] rounded-[4px] transition-transform duration-150 ease-out pointer-events-none" style={{ transform: mode === 'single' ? 'translateX(0)' : 'translateX(100%)' }} />

                            <button
                                onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, mode: 'single' } : c))}
                                className={cn("relative z-10 px-3 py-1 transition-colors duration-150 outline-none w-[70px] text-center cursor-pointer", mode === 'single' ? "text-white" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}
                            >
                                &gt;_ POST
                            </button>
                            <button
                                onClick={() => setCards(prev => prev.map(c => c.id === card.id ? { ...c, mode: 'thread' } : c))}
                                className={cn("relative z-10 px-3 py-1 transition-colors duration-150 outline-none w-[75px] text-center cursor-pointer", mode === 'thread' ? "text-white" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]")}
                            >
                                ≡ THREAD
                            </button>
                        </div>
                    </div>

                    {/* 4. CONTENT ZONE */}
                    <div className="px-[20px] pb-[16px] flex-1 flex flex-col">
                        {mode === 'single' ? (
                            <div
                                className="bg-[var(--bg-deep)] border border-[var(--border-subtle)] border-l-[3px] rounded-[8px] p-[14px_16px] flex-1 flex flex-col"
                                style={{ borderLeftColor: sentimentColorHex }}
                            >
                                <div className={cn(
                                    "font-mono text-[10px] uppercase rounded-[4px] px-[8px] py-[2px] w-fit mb-2 font-medium tracking-tight",
                                    SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS['ANALYSIS']
                                )}>{sentiment}</div>

                                <p className="font-sans text-[14px] leading-[1.7] text-[#d4d4e8] whitespace-pre-wrap flex-1 mt-1">
                                    {content.post}
                                </p>

                                <div className="flex justify-between items-center mt-4">
                                    <span className={cn("font-mono text-[11px]", getCharColor(charCount))}>
                                        {charCount} / 280
                                    </span>
                                    <button
                                        onClick={() => onCopy(content.post, `${card.id}-post`)}
                                        className={cn(
                                            "font-mono text-[11px] rounded-[4px] px-[10px] py-[4px] transition-colors flex items-center gap-1.5 cursor-pointer",
                                            copiedId === `${card.id}-post`
                                                ? "bg-[var(--green-bg)] text-[var(--green)] border border-[var(--green)]"
                                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent"
                                        )}
                                    >
                                        {copiedId === `${card.id}-post` ? <Check size={12} /> : <Copy size={12} />}
                                        {copiedId === `${card.id}-post` ? "COPIED" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 thread-connector">
                                {content.thread.map((tweet, tIdx) => {
                                    const isHighlight = tIdx === 0 || tIdx === 4;
                                    const bColor = isHighlight ? sentimentColorHex : 'var(--border-default)';
                                    const idKey = `${card.id}-t-${tIdx}`;

                                    return (
                                        <div
                                            key={tIdx}
                                            className="group/tweet bg-[var(--bg-overlay)] rounded-[6px] p-[12px_14px] mb-[8px] border-l-[3px] relative z-10"
                                            style={{ borderLeftColor: bColor }}
                                        >
                                            <span className="font-mono text-[10px] text-[var(--text-muted)] absolute top-2 right-12 z-20">TWEET {tIdx + 1}/5</span>
                                            <button
                                                onClick={() => onCopy(tweet, idKey)}
                                                className={cn(
                                                    "absolute top-[6px] right-[6px] p-1.5 rounded transition-colors z-20 cursor-pointer",
                                                    copiedId === idKey
                                                        ? "text-[var(--green)]"
                                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                )}
                                            >
                                                {copiedId === idKey ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                            <p className="font-sans text-[14px] leading-[1.7] text-[#d4d4e8] whitespace-pre-wrap pr-16">{tweet}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 5. HASHTAGS */}
                    <div className="px-[20px] pb-[16px] flex flex-wrap gap-[6px] shrink-0 mt-auto">
                        {content.hashtags.map((tag, tIdx) => (
                            <button
                                key={tIdx}
                                onClick={() => onAppendTag(card.id, tag)}
                                className="font-mono text-[11px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[4px] px-[10px] py-[4px] text-[var(--text-indigo)] hover:border-[var(--text-indigo-light)] hover:bg-[var(--accent-glow)] hover:text-[var(--text-indigo-light)] transition-colors duration-150 cursor-pointer"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                </div>
            )}

            {/* 6. ACTION BAR */}
            {status === 'success' && (
                <div className="p-[12px_20px] border-t border-[var(--border-subtle)] flex gap-[8px] shrink-0 mt-auto">
                    <button
                        onClick={() => onPost(mode === 'single' ? content?.post : content?.thread[0])}
                        disabled={!content}
                        className="flex-1 rounded-[8px] py-[10px] px-[20px] font-sans text-[13px] font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer outline-none hover:shadow-[0_4px_20px_#6366f133]"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
                        onMouseOver={(e) => { if (content) e.currentTarget.style.background = 'linear-gradient(135deg, #818cf8, #6366f1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)'; }}
                    >
                        <span className="text-[14px]">𝕏</span>
                        Transmit
                    </button>
                    <button
                        onClick={onRegenerate}
                        className="group/regen bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[8px] p-[10px_14px] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-none"
                        title="Regenerate Content"
                    >
                        <RefreshCw size={16} className="transition-all duration-400 ease-out group-hover/regen:rotate-180" />
                    </button>
                </div>
            )}

        </motion.div>
    );
}

