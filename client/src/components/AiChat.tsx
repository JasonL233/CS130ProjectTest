import { useMemo, useRef, useState, useEffect } from 'react';
import './AiChat.css';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I’m your FinTrack assistant. Ask me questions about the app. (Actions like “add an expense” will come next.)",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    
    // Clear input and show thinking state
    setInput('');
    setSending(true);
    
    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);

    try {
      // The current messages state plus the new user message
      // We pass the messages currently in the list as history
      const res = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI request failed (${res.status})`);
      }

      const data = (await res.json()) as { reply?: string };
      const reply = data.reply ?? 'Sorry — I did not understand that.';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach the AI service. Please check if the server is running.',
        },
      ]);
    } finally {
      setSending(false);
      queueMicrotask(() => inputRef.current?.focus());
    }
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-thread" ref={threadRef}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`ai-chat-bubble ${m.role === 'user' ? 'ai-chat-bubble-user' : 'ai-chat-bubble-assistant'}`}
          >
            {m.content}
          </div>
        ))}
        {sending && <div className="ai-chat-typing">Thinking…</div>}
      </div>

      <form
        className="ai-chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) {
                void sendMessage();
              }
            }
          }}
          placeholder="Ask FinTrack…"
          aria-label="Chat message"
        />
      </form>
    </div>
  );
}
