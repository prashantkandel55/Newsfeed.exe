import axios from 'axios';

async function test() {
    try {
        const reqs = Array.from({ length: 10 }).map((_, i) => axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: `hello ${i}` }]
        }, {
            headers: {
                "Authorization": `Bearer YOUR_GROQ_KEY`,
                "Content-Type": "application/json"
            }
        }));
        await Promise.all(reqs);
        console.log("ALL SUCCESS");
    } catch (e) {
        console.error("ERROR", e.response ? e.response.status : e.message);
    }
}
test();
