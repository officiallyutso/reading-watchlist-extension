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

  
};

export default AddContentModal;