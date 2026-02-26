import express from 'express';
import { aiModel } from '../../lib/gemini';

const router = express.Router();

type ChatMessage = {
    role: 'user' | 'assistant'; 
    content: string
};

router.post('/chat', async (req, res) => {
    const { message, history } = req.body as { message?: string; history?: ChatMessage[] };

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Missing message' });
    }
    
    // Map history to Gemini's format
    let chat_histories = (history ?? []).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));

    // Gemini requires the first message in history to be from the 'user'
    if (chat_histories.length > 0 && chat_histories[0].role === 'model') {
        chat_histories = chat_histories.slice(1);
    }

    const chat = aiModel.startChat({
        history: chat_histories,
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });

    try {
        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();   // Extract the text from the response

        return res.json({ reply: text });
    } catch (err) {
        console.error('Gemini error', err);
        return res.status(500).json({ error: 'AI request failed' })
    }
});

export const aiRouter = router;