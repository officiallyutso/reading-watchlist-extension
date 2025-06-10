import React, { useState } from 'react';
import { firestoreService } from '../lib/firestore';
import { X } from 'lucide-react';
import type { ContentItem } from '../types';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const AddContentModal: React.FC<AddContentModalProps> = ({ isOpen, onClose, userId }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'article' as ContentItem['type'],
    status: 'todo' as ContentItem['status'],
    progress: 0,
    tags: '',
    author: '',
    duration: '',
    readTime: '',
    episodes: '',
    url: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contentData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        progress: Number(formData.progress)
      };

      // Remove empty optional fields
      Object.keys(contentData).forEach(key => {
        if (!contentData[key as keyof typeof contentData] && 
            !['progress', 'tags'].includes(key)) {
          delete contentData[key as keyof typeof contentData];
        }
      });

      await firestoreService.addContent(userId, contentData);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        type: 'article',
        status: 'todo',
        progress: 0,
        tags: '',
        author: '',
        duration: '',
        readTime: '',
        episodes: '',
        url: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding content:', error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Add New Content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter content title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentItem['type'] })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="article">Article</option>
                <option value="book">Book</option>
                <option value="video">Video</option>
                <option value="show">Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentItem['status'] })}
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Progress (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="programming, react, tutorial"
            />
          </div>

          
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;