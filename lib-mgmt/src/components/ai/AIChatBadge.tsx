import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, User } from 'lucide-react';
import { BeveledBox } from '../common/BeveledBox';
import { Channel, invoke } from '../../lib/runtimeBridge';
import { useCatalogStore } from '../../stores/catalogStore';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export const AIChatBadge: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! I am your AI Librarian. How can I help you navigate the 16,359 records in our catalog today?' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  
  const searchSemantic = useCatalogStore(state => state.searchSemantic);
  const fetchRecords = useCatalogStore(state => state.fetchRecords);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userQuery = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setInput('');
    setIsThinking(true);

    try {
      // 1. Perform semantic search to update the grid and get context
      await searchSemantic(userQuery);
      
      // Get the updated records from the store (using current state)
      // Note: searchSemantic updates the store, so we can use records from useCatalogStore
      // But we need the most recent ones.
      const searchResults = useCatalogStore.getState().records;
      
      const contextData = searchResults.length > 0 
        ? searchResults.slice(0, 5).map(r => `- ${r.title} by ${r.author} (${r.year || 'N/A'})`).join('\n')
        : "No direct matches found in the catalog.";

      // 2. Stream natural language response from Phi-3
      // Create a new empty AI message first
      setMessages(prev => [...prev, { role: 'ai', text: '' }]);
      
      const onChunk = new Channel<string>();
      onChunk.onmessage = (chunk: string) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            text: newMessages[lastIndex].text + chunk
          };
          return newMessages;
        });
      };

      await invoke('chat_with_ai', { 
        prompt: userQuery,
        contextData: contextData,
        onChunk: onChunk
      });
      
    } catch (error) {
      console.error('AI Error:', error);
      const errorMsg = typeof error === 'string' ? error : (error as Error).message || 'Unknown error';
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${errorMsg}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReset = async () => {
    await fetchRecords(1);
    setMessages(prev => [...prev, { role: 'ai', text: 'Catalog view has been reset to the standard listing.' }]);
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out"
      style={{ opacity: isHovered || isOpen ? 1 : 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 rounded-full bg-purple-500 blur-md transition-opacity duration-300 ${isHovered || isOpen ? 'opacity-40' : 'opacity-0'}`} />
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <BeveledBox 
          variant="raised" 
          className={`p-3 rounded-full flex items-center justify-center bg-[#D4D0C8] dark:bg-dark-panel border-2 ${isHovered ? 'border-purple-400' : 'border-gray-400 dark:border-dark-border-light'} transition-colors duration-300`}
        >
          {isOpen ? (
            <Sparkles className="w-6 h-6 text-purple-700 animate-pulse" />
          ) : (
            <Bot className="w-6 h-6 text-gray-700 group-hover:text-purple-700 transition-colors" />
          )}
        </BeveledBox>
        
        {isHovered && !isOpen && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap">
            <BeveledBox variant="sunken" className="px-2 py-1 bg-white dark:bg-dark-input text-[10px] font-bold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider">
              Ask infoLib AI
            </BeveledBox>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-[400px] flex flex-col">
          <BeveledBox variant="raised" className="flex-1 bg-[#D4D0C8] dark:bg-dark-surface flex flex-col shadow-2xl min-h-0">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-1 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-white font-bold text-[11px] uppercase tracking-tighter">infoLib AI Assistant</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={handleReset}
                  title="Reset View"
                  className="w-4 h-4 bg-[#D4D0C8] flex items-center justify-center border border-gray-600 text-[8px] font-bold active:bg-gray-400"
                >
                  R
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-4 h-4 bg-[#D4D0C8] flex items-center justify-center border border-gray-600 text-[10px] font-bold active:bg-gray-400"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 p-2 overflow-hidden flex flex-col gap-2 min-h-0">
              <BeveledBox variant="sunken" className="flex-1 bg-white dark:bg-dark-input p-2 overflow-y-auto text-[12px] font-mono leading-tight min-h-0" ref={scrollRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'ai' ? (
                      <Bot className="w-4 h-4 text-purple-700 shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-blue-700 shrink-0" />
                    )}
                    <div className={`p-2 border ${msg.role === 'ai' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 dark:text-dark-text' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 dark:text-dark-text'} whitespace-pre-wrap`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex gap-2 mb-4">
                    <Bot className="w-4 h-4 text-purple-700 shrink-0 animate-bounce" />
                    <div className="bg-purple-50 dark:bg-purple-900/30 p-2 border border-purple-200 dark:border-purple-800 italic text-gray-500 dark:text-dark-text-muted">
                      AI is thinking...
                    </div>
                  </div>
                )}
              </BeveledBox>

              <div className="flex gap-1 h-8 shrink-0">
                <BeveledBox variant="sunken" className="flex-1 bg-white dark:bg-dark-input px-2 flex items-center">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Search by meaning (e.g. 'folk stories')..." 
                    className="w-full bg-transparent outline-none text-[12px] dark:text-dark-text dark:placeholder-dark-text-muted"
                  />
                </BeveledBox>
                <button 
                  onClick={handleSend}
                  disabled={isThinking}
                  className="group"
                >
                  <BeveledBox variant="raised" className="px-3 h-full bg-[#D4D0C8] dark:bg-dark-panel flex items-center justify-center cursor-pointer active:bg-gray-400 disabled:opacity-50">
                    <Send className={`w-3 h-3 ${isThinking ? 'text-gray-400' : 'text-gray-700 group-hover:text-purple-700'}`} />
                  </BeveledBox>
                </button>
              </div>
            </div>

            <div className="bg-[#D4D0C8] dark:bg-dark-surface border-t border-gray-400 dark:border-dark-border-light px-2 py-0.5 text-[9px] text-gray-600 dark:text-dark-text-muted flex justify-between uppercase font-bold">
              <span>{isThinking ? 'Processing...' : 'Ready'}</span>
              <span className="text-purple-700">Phi-3 + Nomic</span>
            </div>
          </BeveledBox>
        </div>
      )}
    </div>
  );
};
