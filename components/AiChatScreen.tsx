
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { getAiChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import { SparklesIcon, PaperAirplaneIcon } from './icons/FluentIcons';

const AiChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on component mount
    const chat = getAiChat();
    if (chat) {
      chatSessionRef.current = chat;
      setMessages([{
          role: 'model',
          text: 'Hello! I am your AI travel assistant for Uganda. How can I help you plan your journey today?'
      }]);
    } else {
      setError("AI Chat is currently unavailable. Please check if your API key is configured correctly.");
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatSessionRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userInput });
      
      const aiResponse: ChatMessage = { role: 'model', text: response.text };
      setMessages(prev => [...prev, aiResponse]);

    } catch (err) {
      console.error("AI Chat Error:", err);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const bubbleClasses = isUser
      ? 'bg-primary text-white self-end rounded-br-none'
      : 'bg-gray-200 text-text-primary self-start rounded-bl-none';
    const containerClasses = isUser ? 'justify-end' : 'justify-start';

    return (
      <div className={`flex ${containerClasses} animate-fadeIn`}>
        <div className={`px-4 py-2 rounded-xl max-w-lg md:max-w-xl shadow-sm ${bubbleClasses}`}>
          <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
        </div>
      </div>
    );
  };
  
  return (
    <Card title="AI Travel Assistant" className="flex flex-col h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-12rem)]">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-xl max-w-sm bg-gray-200 text-text-primary self-start rounded-bl-none shadow-sm">
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                </div>
            </div>
          </div>
        )}
        {error && !isLoading && (
            <div className="text-center text-xs text-red-500 p-2 bg-red-50 rounded-md">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            name="chatInput"
            type="text"
            placeholder={isLoading ? "AI is thinking..." : "Ask about destinations, services..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isLoading || !!error}
            className="flex-grow"
            autoComplete="off"
          />
          <Button type="submit" variant="primary" size="md" disabled={!userInput.trim() || isLoading || !!error} isLoading={isLoading}>
            <PaperAirplaneIcon className="w-5 h-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default AiChatScreen;
