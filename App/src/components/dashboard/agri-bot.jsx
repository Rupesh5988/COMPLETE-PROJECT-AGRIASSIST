"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Sprout, Loader2 } from "lucide-react";
// Try this IP explicitly instead of 'localhost'
const API_URL = "http://127.0.0.1:5003";

export function AgriBot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Namaste! 🌱 I am your AI Agriculture Expert. Ask me about crops, pests, or fertilizers." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      
      const data = await res.json();
      
      if (data.reply) {
          setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      } else {
          setMessages((prev) => [...prev, { role: "bot", text: "Sorry, I couldn't understand that." }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col border-emerald-100 shadow-lg bg-white">
      {/* Header */}
      <CardHeader className="bg-emerald-600 text-white py-4 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-lg font-medium">
            <div className="bg-white/20 p-2 rounded-full">
                <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
                <p>AgriAssist AI</p>
                <p className="text-xs text-emerald-100 font-normal">Powered by Gemini</p>
            </div>
        </CardTitle>
      </CardHeader>
      
      {/* Chat Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border text-emerald-600'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
                    </div>
                    
                    {/* Bubble */}
                    <div className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
            <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border text-xs text-slate-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    AgriAssist is thinking...
                </div>
            </div>
        )}
        <div ref={scrollRef} />
      </CardContent>

      {/* Input Area */}
      <CardFooter className="p-3 bg-white border-t">
        <div className="flex w-full gap-2 relative">
            <Input 
                placeholder="Ask about fertilizer, pests, etc..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-full pl-4 pr-12"
            />
            <Button 
                onClick={handleSend} 
                size="icon"
                disabled={loading}
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700"
            >
                <Send className="w-4 h-4 text-white" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}