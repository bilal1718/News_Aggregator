import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  getArticles, 
  getArticleComments, 
  addComment, 
  addReaction, 
  getArticleReactions,
  addNote,
  getUserNotes,
  createReport,
  getArticleById,
  sendAIMessage
} from '../services/api';


const ArticleDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState({ likeCount: 0, dislikeCount: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [existingNote, setExistingNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNoteSubmitting, setIsNoteSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    reportType: 'inappropriate_content',
    details: ''
  });
  
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  
  const [activeTab, setActiveTab] = useState('article');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarTab, setMobileSidebarTab] = useState('comments');
  
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showReadSettings, setShowReadSettings] = useState(false);
  const [parsedContent, setParsedContent] = useState([]);
  
  const commentInputRef = useRef(null);
  const sidebarRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        const englishVoice = voices.find(voice => voice.lang.includes('en-'));
        setSelectedVoice(englishVoice || voices[0]);
      }
    };

    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.onvoiceschanged) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      }
    };
  }, []);

  useEffect(() => {
    const fetchArticleData = async () => {
      setIsLoading(true);
      try {
        const articleData = await getArticleById(id);
        setArticle(articleData);
        
        if (articleData && articleData.content) {
          const processed = parseContent(articleData.content);
          setParsedContent(processed);
        }
    
        const commentsData = await getArticleComments(id);
        setComments(commentsData);
    
        const reactionsData = await getArticleReactions(id);
        setReactions({
          likeCount: reactionsData.counts.likeCount,
          dislikeCount: reactionsData.counts.dislikeCount,
        });
    
        if (currentUser) {
          const userReactionData = reactionsData.reactions.find(r => r.userId === currentUser.userId);
          if (userReactionData) {
            setUserReaction(userReactionData.type);
          }
        }
    
        const notesData = await getUserNotes();
        const existingNote = notesData.find(n => n.articleId.toString() === id);
        if (existingNote) {
          setExistingNote(existingNote);
          setNoteText(existingNote.content);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching article data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticleData();

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      stopReading();
    };
  }, [id, currentUser]);
  
  useEffect(() => {
    if (article && article.content) {
      const contentToUse = showSummary && summary ? summary : article.content;
      const processed = parseContent(contentToUse);
      setParsedContent(processed);
    }
  }, [article, summary, showSummary]);
  
  const parseContent = (content) => {
    if (!content) return [];
    
    let paragraphs = content.split('\n').filter(p => p.trim() !== '');
    
    return paragraphs.map(paragraph => {
      const cleanParagraph = paragraph.replace(/<[^>]*>/g, '');
      
      if (cleanParagraph.length > 800) {
        const sentences = cleanParagraph.match(/[^.!?]+[.!?]+/g) || [cleanParagraph];
        
        const chunks = [];
        let currentChunk = "";
        
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > 500) {
            chunks.push(currentChunk);
            currentChunk = sentence;
          } else {
            currentChunk += sentence;
          }
        }
        
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        return chunks;
      }
      
      return cleanParagraph;
    }).flat(); 
  };
  
  const startReading = (fromBeginning = true) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    window.speechSynthesis.cancel();
    
    if (fromBeginning) {
      setCurrentParagraphIndex(0);
    }
    
    readParagraph(fromBeginning ? 0 : currentParagraphIndex);
    
    setIsReading(true);
    setIsPaused(false);
  };
  
  const readParagraph = (index) => {
    if (index >= parsedContent.length) {
      setIsReading(false);
      setCurrentParagraphIndex(0);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(parsedContent[index]);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = readingSpeed;
    
    utterance.onend = () => {
      setCurrentParagraphIndex(index + 1);
      readParagraph(index + 1);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsReading(false);
    };
    
    speechSynthesisRef.current = utterance;
    
    window.speechSynthesis.speak(utterance);
  };
  
  const pauseReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  const resumeReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  const stopReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setIsPaused(false);
      setCurrentParagraphIndex(0);
    }
  };
  
  const changeReadingSpeed = (speed) => {
    setReadingSpeed(speed);
    
    if (isReading && !isPaused) {
      window.speechSynthesis.cancel();
      readParagraph(currentParagraphIndex);
    }
  };
  
  const changeVoice = (voice) => {
    setSelectedVoice(voice);
    
    if (isReading && !isPaused) {
      window.speechSynthesis.cancel();
      readParagraph(currentParagraphIndex);
    }
  };
  
  const generateSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }
    
    setIsSummarizing(true);
    setSummaryError(null);
    
    try {
      const prompt = `Please provide a concise summary of the following article:\n\nTitle: ${article.title}\n\nContent: ${article.content}`;
      
      const response = await sendAIMessage(prompt);
      
      setSummary(response.reply || response.text || response.content);
      setShowSummary(true);
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummaryError('Failed to generate summary. Please try again later.');
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newComment = await addComment(id, commentText);
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReaction = async (type) => {
    try {
      await addReaction(id, type);
      
      setReactions(prev => {
        const newReactions = { ...prev };
        
        if (userReaction) {
          if (userReaction === 'like') newReactions.likeCount--;
          if (userReaction === 'dislike') newReactions.dislikeCount--;
        }
        
        if (type === 'like') newReactions.likeCount++;
        if (type === 'dislike') newReactions.dislikeCount++;
        
        return newReactions;
      });
      
      setUserReaction(type);
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };
  
  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    
    setIsNoteSubmitting(true);
    try {
      const note = await addNote(id, noteText);
      setExistingNote(note);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsNoteSubmitting(false);
    }
  };
  
  const handleReportSubmit = async () => {
    try {
      await createReport('article', id, reportData.reportType, reportData.details);
      setShowReportModal(false);
    } catch (err) {
      console.error('Error reporting content:', err);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return now.toLocaleDateString(undefined, options);
    }
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleSidebar = (tab) => {
    if (mobileSidebarTab === tab && sidebarOpen) {
      setSidebarOpen(false);
    } else {
      setMobileSidebarTab(tab);
      setSidebarOpen(true);
    }
  };

  const handleCommentClick = () => {
    toggleSidebar('comments');
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 300);
  };
  
  // Function to toggle read settings panel
  const toggleReadSettings = () => {
    setShowReadSettings(!showReadSettings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-30 md:hidden">
        <button 
          onClick={() => setActiveTab('article')}
          className={`flex flex-col items-center px-4 pt-2 pb-1 ${activeTab === 'article' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <span className="text-xs">Article</span>
        </button>
        
        <button 
          onClick={() => toggleSidebar('comments')}
          className={`flex flex-col items-center px-4 pt-2 pb-1 ${mobileSidebarTab === 'comments' && sidebarOpen ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-xs">Comments</span>
          {comments.length > 0 && (
            <span className="absolute top-1 right-4 w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
              {comments.length}
            </span>
          )}
        </button>
        
        <button 
          onClick={() => toggleSidebar('notes')}
          className={`flex flex-col items-center px-4 pt-2 pb-1 ${mobileSidebarTab === 'notes' && sidebarOpen ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-xs">Notes</span>
          {existingNote && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto mb-20 md:mb-0">
        {activeTab === 'article' && (
          <div className="w-full md:w-2/3 px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-white rounded-lg shadow-md p-5 md:p-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800 mb-3">
                    {article.category}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
                </div>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>Source: {article.source}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Summary button */}
                <button
                  onClick={generateSummary}
                  disabled={isSummarizing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSummarizing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating AI Summary...
                    </>
                  ) : summary ? (
                    showSummary ? "Show Original Article" : "Show AI Summary"
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate AI Summary
                    </>
                  )}
                </button>
                
                {/* Read Aloud Controls */}
                <div className="relative">
                  {!isReading ? (
                    <button
                      onClick={() => startReading()}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      Read Aloud
                    </button>
                  ) : (
                    <div className="inline-flex rounded-md shadow-sm">
                      {isPaused ? (
                        <button
                          onClick={resumeReading}
                          className="inline-flex items-center px-3 py-2 border border-transparent rounded-l-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                          <span className="ml-1">Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={pauseReading}
                          className="inline-flex items-center px-3 py-2 border border-transparent rounded-l-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="ml-1">Pause</span>
                        </button>
                      )}
                      <button
                        onClick={stopReading}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        <span className="ml-1">Stop</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Settings button */}
                  <button
                    onClick={toggleReadSettings}
                    className="ml-2 inline-flex items-center px-2 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  
                  {/* Read aloud settings panel */}
                  {showReadSettings && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Read Aloud Settings</h3>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reading Speed
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Slow</span>
                            <input
                              type="range"
                              min="0.5"
                              max="2"
                              step="0.1"
                              value={readingSpeed}
                              onChange={(e) => changeReadingSpeed(parseFloat(e.target.value))}
                              className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">Fast</span>
                          </div>
                          <div className="text-center text-xs text-gray-500 mt-1">
                            {readingSpeed.toFixed(1)}x
                          </div>
                        </div>
                        
                        {availableVoices.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Voice
                            </label>
                            <select
                              value={selectedVoice ? selectedVoice.name : ''}
                              onChange={(e) => {
                                const voice = availableVoices.find(v => v.name === e.target.value);
                                if (voice) changeVoice(voice);
                              }}
                              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                            >
                              {availableVoices.map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                  {voice.name} ({voice.lang})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {isReading && (
                          <button
                            onClick={stopReading}
                            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            Stop Reading
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {summaryError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{summaryError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isReading && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Currently reading aloud{isPaused ? " (paused)" : ""}...
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={stopReading}
                      className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Stop
                    </button>
                  </div>
                </div>
              )}
              
              {summary && showSummary ? (
                <div className="prose prose-lg max-w-none mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-lg font-medium text-indigo-800 mb-3">AI Summary</h3>
                  {summary.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                    <p 
                      key={idx} 
                      className={`mb-3 last:mb-0 ${
                        isReading && currentParagraphIndex === idx ? 'bg-yellow-100 rounded p-1' : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="prose prose-lg max-w-none mb-6">
                  {parsedContent.map((paragraph, idx) => (
                    <p 
                      key={idx} 
                      className={`mb-4 ${
                        isReading && currentParagraphIndex === idx ? 'bg-yellow-100 rounded p-1' : ''
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleReaction('like')} 
                    className={`flex items-center space-x-1 ${userReaction === 'like' ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={userReaction === 'like' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{reactions.likeCount}</span>
                  </button>
                  <button 
                    onClick={() => handleReaction('dislike')} 
                    className={`flex items-center space-x-1 ${userReaction === 'dislike' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={userReaction === 'dislike' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    <span>{reactions.dislikeCount}</span>
                  </button>
                </div>
                
                <div className="hidden md:block">
                  <button 
                    onClick={handleCommentClick}
                    className="flex items-center text-gray-500 hover:text-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>{comments.length} Comment{comments.length !== 1 ? 's' : ''}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div
          ref={sidebarRef}
          className={`w-full md:w-1/3 bg-white md:bg-transparent fixed inset-y-0 right-0 transform ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 md:z-0 overflow-y-auto pt-4 md:pt-6 px-0 md:px-4 pb-24`}
          style={{ maxHeight: '100vh', top: '64px' }}
        >
          <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10">
            <h2 className="text-lg font-medium text-gray-900">
              {mobileSidebarTab === 'comments' ? 'Comments' : 'Personal Notes'}
            </h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setMobileSidebarTab('comments')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                mobileSidebarTab === 'comments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Comments ({comments.length})
            </button>
            <button
              onClick={() => setMobileSidebarTab('notes')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                mobileSidebarTab === 'notes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Notes
            </button>
          </div>
          
          <div className="px-4 md:px-0">
            {mobileSidebarTab === 'comments' && (
              <div className="bg-white rounded-lg shadow-md md:shadow p-4">
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="mb-2">
                    <textarea
                      ref={commentInputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Posting...
                        </>
                      ) : 'Post Comment'}
                    </button>
                  </div>
                </form>
                
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.commentId} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="font-medium text-gray-900">{comment.commenter?.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500 ml-2">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                        <div className="text-gray-700">{comment.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {mobileSidebarTab === 'notes' && (
              <div className="bg-white rounded-lg shadow-md md:shadow p-4">
                <div className="mb-4">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add your personal notes about this article..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="8"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    disabled={isNoteSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isNoteSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : existingNote ? 'Update Note' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isReading && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 z-30 flex items-center space-x-3 border border-gray-200">
          {isPaused ? (
            <button
              onClick={resumeReading}
              className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={pauseReading}
              className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          
          <button
            onClick={stopReading}
            className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={readingSpeed}
              onChange={(e) => changeReadingSpeed(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-700">{readingSpeed.toFixed(1)}x</span>
          </div>
        </div>
      )}
      
      {showReportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Report Content</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportData.reportType}
                  onChange={(e) => setReportData({ ...reportData, reportType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="harassment">Harassment</option>
                  <option value="spam">Spam</option>
                  <option value="hate_speech">Hate Speech</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details
                </label>
                <textarea
                  value={reportData.details}
                  onChange={(e) => setReportData({ ...reportData, details: e.target.value })}
                  placeholder="Please provide details about your report..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;