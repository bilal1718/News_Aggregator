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
  getUserNotes
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
  const [activeTab, setActiveTab] = useState('article');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarTab, setMobileSidebarTab] = useState('comments');
  const commentInputRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchArticleData = async () => {
      setIsLoading(true);
      try {
        const articlesData = await getArticles();
        const foundArticle = articlesData.find(a => a.articleId.toString() === id);
        
        if (!foundArticle) {
          throw new Error('Article not found');
        }
        
        setArticle(foundArticle);
        
        const commentsData = await getArticleComments(id);
        setComments(commentsData);
        
        const reactionsData = await getArticleReactions(id);
        setReactions({
          likeCount: reactionsData.counts.likeCount,
          dislikeCount: reactionsData.counts.dislikeCount
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id, currentUser]);

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

  const formatDate = (dateString) => {
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
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize bg-blue-100 text-blue-800 mb-3">
                {article.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>Source: {article.source}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              
              <div className="prose prose-lg max-w-none mb-6">
                {article.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
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
                   шу rows="8"
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
    </div>
  );
};

export default ArticleDetail;