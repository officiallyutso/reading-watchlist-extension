import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../lib/firestore';
import { BookOpen, Video, FileText, Tv, Plus, Search, Filter, User, LogOut, Star, Clock, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import type { ContentItem } from '../types';
import AddContentModal from '../components/AddContentModal';
import EditContentModal from '../components/EditContentModal';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsubscribe = firestoreService.subscribeToUserContent(
      currentUser.uid,
      (content) => {
        setItems(content);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await firestoreService.deleteContent(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleProgressUpdate = async (id: string, newProgress: number) => {
    try {
      const status = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'todo';
      await firestoreService.updateContent(id, { progress: newProgress, status });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      case 'show': return <Tv className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <Star className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'video': return 'text-red-600 bg-red-50 border-red-200';
      case 'article': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'show': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'all' || item.type === activeTab || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: items.length,
    inProgress: items.filter(item => item.status === 'in-progress').length,
    completed: items.filter(item => item.status === 'completed').length,
    todo: items.filter(item => item.status === 'todo').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mr-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Traylist
                </h1>
                <p className="text-sm text-slate-500">Content Manager</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center px-3 py-2 bg-slate-100 rounded-lg">
                <User className="w-4 h-4 mr-2 text-slate-600" />
                <span className="text-sm text-slate-700 font-medium">
                  {currentUser?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total Items</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-slate-600">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-600">{stats.todo}</div>
            <div className="text-sm text-slate-600">To Do</div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search your content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center font-semibold transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Content
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'All', icon: Filter },
            { id: 'book', label: 'Books', icon: BookOpen },
            { id: 'article', label: 'Articles', icon: FileText },
            { id: 'video', label: 'Videos', icon: Video },
            { id: 'show', label: 'Shows', icon: Tv },
            { id: 'todo', label: 'To Do', icon: Clock },
            { id: 'in-progress', label: 'In Progress', icon: Star },
            { id: 'completed', label: 'Completed', icon: CheckCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center border ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all group relative">
              {/* Action buttons */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={() => setEditingItem(item)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id!)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-4 pr-20">
                <div className={`flex items-center px-3 py-1 rounded-lg border text-sm font-medium ${getTypeColor(item.type)}`}>
                  {getIcon(item.type)}
                  <span className="ml-2 capitalize">{item.type}</span>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="ml-1 capitalize">{item.status.replace("-", " ")}</span>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              
              {item.author && (
                <p className="text-slate-600 text-sm mb-3">by {item.author}</p>
              )}
              
              {item.duration && (
                <p className="text-slate-600 text-sm mb-3">Duration: {item.duration}</p>
              )}
              
              {item.readTime && (
                <p className="text-slate-600 text-sm mb-3">Read time: {item.readTime}</p>
              )}
              
              {item.episodes && (
                <p className="text-slate-600 text-sm mb-3">Episodes: {item.episodes}</p>
              )}
              
              {/* Progress bar with click to update */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold">{item.progress}%</span>
                </div>
                <div 
                  className="w-full bg-slate-200 rounded-full h-2 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const newProgress = Math.round((x / rect.width) * 100);
                    handleProgressUpdate(item.id!, Math.max(0, Math.min(100, newProgress)));
                  }}
                >
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="text-xs text-slate-500 font-medium">
                Added {new Date(item.addedDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No content found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or filters' 
                : 'Start building your content library by adding your first item'
              }
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
            >
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Your First Item
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (() => {
        const userId = currentUser?.uid;
        if (!userId) return null;

        return (
          <AddContentModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            userId={userId}
          />
        );
      })()}


      {editingItem && (
        <EditContentModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
        />
      )}
    </div>
  );
};

export default Dashboard;