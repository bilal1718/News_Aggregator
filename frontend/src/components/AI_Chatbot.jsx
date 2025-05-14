import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, X, ChevronDown, Share2, ThumbsUp, Newspaper, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { sendAIMessage } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import TimeAgo from 'react-timeago';
import ReactMarkdown from 'react-markdown';

const NEWS_CATEGORIES = [
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'politics', label: 'Politics' },
  { id: 'health', label: 'Health' },
  { id: 'science', label: 'Science' },
  { id: 'sports', label: 'Sports' },
];

const QUICK_QUERIES = [
  { id: 'trending', text: 'What\'s trending today?' },
  { id: 'breaking', text: 'Any breaking news?' },
  { id: 'summarize', text: 'Summarize top stories' },
  { id: 'local', text: 'Local news updates' },
];

const NewsCard = ({ title, source, url, imageUrl, publishedAt }) => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 my-2 hover:shadow-md transition-shadow">
    {imageUrl && (
      <div className="h-32 overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="p-3">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500 flex items-center">
          <Newspaper className="h-3 w-3 mr-1" />
          {source}
        </span>
        <span className="text-xs text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <TimeAgo date={publishedAt} />
        </span>
      </div>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-2 text-xs flex items-center text-blue-600 hover:text-blue-800"
      >
        Read full article <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    </div>
  </div>
);

const parseNewsData = (text) => {
  const newsRegex = /\[NEWS\]([\s\S]*?)(?:\[\/NEWS\]|$)/;
  const match = text.match(newsRegex);
  
  if (!match) return { parsedText: text, newsItems: null };
  
  try {
    const newsContent = match[1].trim();
    
    const newsItems = newsContent.split('---').map(item => {
      const itemData = {};
      const lines = item.trim().split('\n');
      
      lines.forEach(line => {
        const [key, ...values] = line.split(':');
        if (key && values.length) {
          const value = values.join(':').trim();
          itemData[key.trim().toLowerCase()] = value;
        }
      });
      
      return {
        title: itemData.title || itemData.headline || 'News Item',
        source: { name: itemData.source || 'News Source' },
        url: itemData.url || '#',
        urlToImage: itemData.image || itemData.urltoimage || null,
        publishedAt: itemData.published || itemData.publishedat || new Date().toISOString()
      };
    }).filter(item => item.title !== 'News Item' || item.url !== '#');
    
    const parsedText = text.replace(newsRegex, '').trim();
    
    return { parsedText, newsItems: newsItems.length > 0 ? newsItems : null };
  } catch (error) {
    console.error('Error parsing news data:', error);
    return { parsedText: text, newsItems: null };
  }
};

const MessageContent = ({ content }) => {
  const processedContent = content.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
  );
  
  return (
    <div 
      className="message-content"
      dangerouslySetInnerHTML={{ 
        __html: processedContent
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^- (.*)/gm, '• $1')
      }}
    />
  );
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your news assistant. I can help you discover the latest news, summarize articles, and answer questions about current events. What would you like to know today?", 
      isBot: true,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 0 && messages[messages.length - 1].isBot) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isOpen]);

  const simulateTyping = (text) => {
    setIsTyping(true);
    const typingDuration = Math.min(2000, Math.max(800, text.length * 20));
    
    return new Promise(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, typingDuration);
    });
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = { 
        id: messages.length + 1, 
        text: message, 
        isBot: false,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      setIsLoading(true);
      setApiError(null);

      try {
        const response = await sendAIMessage(message);

        const aiResponseText = response.text || response.content || 
                              (response.candidates && response.candidates[0]?.content?.parts[0]?.text) || 
                              "I received your message but couldn't generate a proper response.";
        
        let newsData = null;
        let displayText = aiResponseText;
        
        if (response.news || (response.data && response.data.articles)) {
          newsData = response.news || response.data?.articles;
        } 
        else if (aiResponseText.includes('[NEWS]')) {
          const { parsedText, newsItems } = parseNewsData(aiResponseText);
          displayText = parsedText;
          newsData = newsItems;
        }
        
        await simulateTyping(aiResponseText);
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: displayText,
          isBot: true,
          timestamp: new Date().toISOString(),
          newsData: newsData
        }]);
      } catch (error) {
        console.error('Error:', error);
        setApiError(error.message || "Connection error");
        
        await simulateTyping("I apologize, but I encountered an error. Please try again.");
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: "I apologize, but I encountered an error. Please try again.",
          isBot: true,
          timestamp: new Date().toISOString(),
          isError: true
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuickQuery = (query) => {
    setMessage(query);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleCategorySelect = (category) => {
    handleQuickQuery(`Show me the latest ${category.label.toLowerCase()} news`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

  const clearChat = () => {
    setMessages([
      { 
        id: 1, 
        text: "Chat has been reset. How can I help you with news today?", 
        isBot: true,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-96 mb-4 overflow-scroll hide-scrollbar"
            style={{ 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxHeight: minimized ? '60px' : '80vh',
            }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-300' : isTyping ? 'bg-green-300 animate-pulse' : apiError ? 'bg-red-500' : 'bg-green-400'}`}></div>
                  <h3 className="font-semibold">
                    NewsAssist AI
                    {apiError && <span className="ml-2 text-xs text-red-200">⚠️ Connection Issue</span>}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={toggleMinimize}
                    className="p-1 hover:bg-blue-700 rounded"
                    aria-label={minimized ? "Expand chat" : "Minimize chat"}
                  >
                    <ChevronDown className="h-4 w-4" style={{ transform: minimized ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-blue-700 rounded"
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {!minimized && (
              <>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex overflow-x-auto hide-scrollbar">
                  {NEWS_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 mr-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 whitespace-nowrap transition-colors"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                {apiError && (
                  <div className="px-4 py-2 bg-red-50 text-red-800 text-xs border-b border-red-100">
                    <div className="flex items-center">
                      <div className="mr-2 text-red-500">⚠️</div>
                      <div>
                        <p className="font-medium">Connection issue</p>
                        <p>{apiError}. Please try again later.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="h-[calc(80vh-230px)] min-h-[300px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className="flex flex-col max-w-[80%]">
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            msg.isBot
                              ? msg.isError 
                                ? 'bg-red-50 text-red-800 border border-red-100' 
                                : 'bg-white shadow-sm border border-gray-100 text-gray-800'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <MessageContent content={msg.text} />
                          
                          {msg.newsData && Array.isArray(msg.newsData) && msg.newsData.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.newsData.slice(0, 3).map((newsItem, idx) => (
                                <NewsCard 
                                  key={idx}
                                  title={newsItem.title || newsItem.headline}
                                  source={newsItem.source?.name || newsItem.publisher || "News Source"}
                                  url={newsItem.url || "#"}
                                  imageUrl={newsItem.urlToImage || newsItem.image}
                                  publishedAt={newsItem.publishedAt || new Date().toISOString()}
                                />
                              ))}
                              {msg.newsData.length > 3 && (
                                <div className="text-center text-xs text-blue-600 mt-1">
                                  + {msg.newsData.length - 3} more news items
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div 
                          className={`text-xs mt-1 ${
                            msg.isBot ? 'text-left text-gray-500' : 'text-right text-gray-400'
                          }`}
                        >
                          {!msg.isBot && (
                            <span className="ml-1">
                              ✓
                            </span>
                          )}
                        </div>
                        
                        {msg.isBot && !msg.isError && (
                          <div className="flex space-x-2 mt-1">
                            <button className="text-gray-400 hover:text-gray-600 text-xs flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" /> Helpful
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 text-xs flex items-center">
                              <Share2 className="h-3 w-3 mr-1" /> Share
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-white shadow-sm border border-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isLoading && !isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-white shadow-sm border border-gray-100 text-gray-500 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm">Processing your request...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Quick Questions:</p>
                  <div className="flex overflow-x-auto pb-2 hide-scrollbar">
                    {QUICK_QUERIES.map(query => (
                      <button
                        key={query.id}
                        onClick={() => handleQuickQuery(query.text)}
                        className="px-3 py-1.5 text-xs whitespace-nowrap rounded-lg mr-2 bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      >
                        {query.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask about news, events, or topics..."
                        className="w-full rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900 placeholder-gray-500"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
                      className={`p-3 rounded-r-lg transition-colors ${
                        isLoading || !message.trim()
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex justify-between mt-2 px-1 text-xs text-gray-500">
                    <button 
                      onClick={clearChat}
                      className="hover:text-blue-600 flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Clear chat
                    </button>
                    <span>NewsAssist AI - Powering your news discovery</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center relative"
        style={{ 
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.5), 0 10px 10px -5px rgba(37, 99, 235, 0.2)',
        }}
      >
        <MessageCircle className="h-6 w-6" />
        
        {!isOpen && unreadCount > 0 && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbot;