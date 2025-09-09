'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chips?: string[];
  showContent?: 'philosophy' | 'technology' | 'experiences';
}

export default function ConversationalChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! How are you feeling today? I'm here to help guide you to the perfect wellness experience.",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPathway, setCurrentPathway] = useState<any>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeUserIntent = async (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze emotional state and needs
    const stressKeywords = ['stress', 'tired', 'exhausted', 'overwhelmed', 'anxious'];
    const energyKeywords = ['energy', 'motivation', 'inspire', 'boost', 'activate'];
    const resetKeywords = ['reset', 'clear', 'refresh', 'restart', 'begin again'];
    const deepKeywords = ['deep', 'intense', 'transform', 'profound', 'serious'];
    
    let suggestedPathway = null;
    let responseContent = '';
    let chips: string[] = [];
    
    if (stressKeywords.some(keyword => lowerMessage.includes(keyword))) {
      if (deepKeywords.some(keyword => lowerMessage.includes(keyword))) {
        suggestedPathway = 'deep_implosion';
        responseContent = "I hear you - you need a deep reset. The Deep Implosion journey (2.5 hours) combines float, contrast therapy, and our AOI Air Pro for profound transformation. It's our most intensive reset protocol.";
        chips = ['Tell me more', 'Book Deep Implosion', 'Show me lighter options'];
      } else {
        suggestedPathway = 'reset_mini';
        responseContent = "It sounds like you need to clear the mental clutter. Our Reset Mini (90 minutes) starts with a float tank to quiet the mind, then ice bath for clarity, finishing with AOI Air to integrate. Perfect for washing away stress.";
        chips = ['That sounds perfect', 'Book Reset Mini', 'I need something deeper'];
      }
    } else if (energyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      suggestedPathway = 'activate_mini';
      responseContent = "You're looking to activate your energy! Our Activate Mini-Contrast (90 minutes) alternates hot and cold with ice bath and AOI Air, creating cellular activation. Like a reset button for your energy systems.";
      chips = ['Book Activate Mini', 'Tell me about Activate Maxi', 'Show the science'];
    } else if (lowerMessage.includes('morning') || lowerMessage.includes('afternoon')) {
      responseContent = "Great! Let me check availability and create your personalized journey. Which day works best for you?";
      chips = ['Today', 'Tomorrow', 'This week'];
    }
    
    return { suggestedPathway, responseContent, chips };
  };

  const controlBookingForm = (action: string, data: any) => {
    // Dispatch custom event to control the booking form
    window.dispatchEvent(new CustomEvent('chatControlBooking', {
      detail: { action, data }
    }));
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Analyze intent and generate response
    const { suggestedPathway, responseContent, chips } = await analyzeUserIntent(input);
    
    // If a pathway is suggested, fetch its details
    if (suggestedPathway) {
      const { data: pathway } = await supabase
        .from('experience_pathways')
        .select('*')
        .eq('name', suggestedPathway)
        .single();
      
      if (pathway) {
        setCurrentPathway(pathway);
        // Control the booking form
        controlBookingForm('selectPathway', { 
          pathwayId: pathway.id,
          details: pathway
        });
      }
    }
    
    // Check for time selection
    if (input.toLowerCase().includes('2pm') || input.toLowerCase().includes('14:00')) {
      controlBookingForm('selectTime', { time: '14:00' });
    }
    
    // Check for date selection
    if (input.toLowerCase().includes('today')) {
      const today = new Date().toISOString().split('T')[0];
      controlBookingForm('selectDate', { date: today });
    } else if (input.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      controlBookingForm('selectDate', { date: tomorrow.toISOString().split('T')[0] });
    }
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent || "Let me help you find the perfect experience. Are you looking to energize, reset, or deeply transform today?",
        chips: chips.length > 0 ? chips : ['Energize', 'Reset', 'Transform']
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleChipClick = (chip: string) => {
    setInput(chip);
    handleSend();
  };

  return (
    <div className="flex flex-col h-[500px] bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          Your Wellness Guide
        </h3>
        <p className="text-white/60 text-sm mt-1">
          Let's find the perfect journey for you
        </p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-purple-500' : 'bg-white/10'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className={`px-4 py-2 rounded-xl ${
                    message.role === 'user' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/10 text-white/90'
                  }`}>
                    {message.content}
                  </div>
                </div>
                
                {/* Suggestion Chips */}
                {message.chips && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-10">
                    {message.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip)}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white/70 text-sm transition-all"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex items-center gap-2 text-white/60">
            <Bot className="w-4 h-4" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell me how you're feeling..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
