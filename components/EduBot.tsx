"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Sparkles } from "lucide-react";

type Message = { id: string; sender: "bot" | "user"; text: string; link?: { label: string; href: string } };

const MOCK_DB = [
  { keywords: ["register", "institute", "apply"], text: "To register your coaching center, simply follow the new 2024 compliance guidelines and complete the official Registration Form.", link: { label: "Go to Institute Registration", href: "/admin/register-institute" } },
  { keywords: ["complaint", "issue", "report"], text: "If you notice a safety violation or want to report an issue, please use our secure Complaint Portal. Your identity can remain anonymous.", link: { label: "File a Complaint", href: "/complaint" } },
  { keywords: ["square meter", "area", "capacity", "rule"], text: "The new guidelines strictly dictate a minimum of 1 square meter per student to prevent overcrowding. Your max capacity will auto-calculate based on this." },
  { keywords: ["status", "pending", "approve"], text: "Once you register, the District Admin reviews your application. After approval, you will receive an animated alert or email with your new Login ID and password!" },
  { keywords: ["login", "sign in", "dashboard"], text: "If you already have your credentials, you can log in below to access your dashboard.", link: { label: "Go to Login", href: "/login" }},
  { keywords: ["hello", "hi", "hey"], text: "Hello there! I'm EduBot, your Smart AI Assistant. Need help registering an institute or filing a complaint?" }
];

export default function EduBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "bot", text: "Hi! I'm EduBot. How can I assist you with EduShield today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const simulateAI = (userMsg: string) => {
    setIsTyping(true);
    setTimeout(() => {
       const lowerMsg = userMsg.toLowerCase();
       let found = MOCK_DB.find(rule => rule.keywords.some(kw => lowerMsg.includes(kw)));
       
       let botMsg: Message = { id: Date.now().toString(), sender: "bot", text: "I'm still learning! But you can navigate manually to our main areas via the top navigation bar." };
       
       if (found) {
         botMsg = { id: Date.now().toString(), sender: "bot", text: found.text, link: found.link };
       }
       
       setMessages(prev => [...prev, botMsg]);
       setIsTyping(false);
    }, 1500 + Math.random() * 1000); // 1.5 - 2.5s simulated delay
  };

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    const newMsg: Message = { id: Date.now().toString(), sender: "user", text };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    simulateAI(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-2 group z-50 ring-4 ring-indigo-600/20"
          >
            <Sparkles className="h-5 w-5 absolute -top-1 -right-1 text-amber-300 animate-pulse" />
            <MessageSquare className="h-6 w-6" />
            <span className="font-semibold px-1 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
              Chat with EduBot
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">EduBot AI</h3>
                  <p className="text-indigo-200 text-xs flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm shadow-sm'}`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.link && (
                      <a href={msg.link.href} className="mt-2 inline-block px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold text-xs border border-indigo-100 hover:bg-indigo-100 transition-colors">
                        {msg.link.label} →
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-neutral-200 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                    <div className="h-2 w-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-neutral-300 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Chips */}
            <div className="px-4 py-3 bg-white flex gap-2 overflow-x-auto whitespace-nowrap border-t border-neutral-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {["How to register?", "Square meter rule", "File complaint"].map(chip => (
                <button key={chip} onClick={() => handleSend(chip)} className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-semibold transition-colors shrink-0">
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask EduBot something..."
                className="flex-1 bg-neutral-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full px-4 py-2.5 text-sm transition-all outline-none"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full transition-colors shrink-0 shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
