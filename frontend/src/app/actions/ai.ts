'use server';

export async function askAI(messages: any[]) {
    const url = "https://inference.do-ai.run/v1/chat/completions";
    const apiKey = process.env.DO_AI_API_KEY;

    if (!apiKey) {
        throw new Error("DO_AI_API_KEY is not configured in environment variables.");
    }

    const data = {
        model: "kimi-k2.5",
        messages: messages,
        max_tokens: 800,
        temperature: 0.2
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });
        
        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`API Error: ${res.status} ${errBody}`);
        }
        
        const json = await res.json();
        return json.choices[0].message;
    } catch (err: any) {
        console.error("AI Error:", err);
        throw new Error(err.message || "Failed to communicate with AI");
    }
}
