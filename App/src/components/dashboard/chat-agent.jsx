"use client";

// This is a new component for your AI Agent Chatbot.
import { useState, useRef, useEffect } from 'react';


export default function ChatAgent() {
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Hi! I am AgriAssist. How can I help you today? Ask me for a crop or fertilizer recommendation!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send the *new message* to your Flask backend
      const response = await fetch('http://127.0.0.1:5004/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          user_id: 'user_123' // In a real app, you'd get this from user auth
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add the AI's response to the chat
      setMessages((prev) => [...prev, data]);

    } catch (error) {
      console.error('Failed to fetch:', error);
      setMessages((prev) => [...prev, { role: 'model', content: 'Sorry, I am having trouble connecting to my brain. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // You can style this component to fit your project
    // Using Tailwind CSS classes inspired by your design
    <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-lg max-w-lg w-full h-[600px] flex flex-col p-4 m-4">
      
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">AgriAssist Agent</h3>
      
      {/* Message Area */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'  // Your project's green
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg shadow-md">
              <span className="animate-pulse">AgriAssist is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a recommendation..."
          className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 disabled:bg-gray-400"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}