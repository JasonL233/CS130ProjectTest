import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Using 2.0-flash-lite which often has more available quota for free tier users
export const aiModel = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: "You are FinTrack AI, a helpful personal finance assistant."
});
