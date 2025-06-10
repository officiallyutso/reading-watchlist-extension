import React, { useState } from 'react';
import { firestoreService } from '../lib/firestore';
import { X } from 'lucide-react';
import type { ContentItem } from '../types';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
}

const EditContentModal: React.FC<EditContentModalProps> = ({ isOpen, onClose, item }) => {
  const [formData, setFormData] = useState({
    title: item.title,
    type: item.type,
    status: item.status,
    progress: item.progress,
    tags: item.tags.join(', '),
    author: item.author || '',
    duration: item.duration || '',
    readTime: item.readTime || '',
    episodes: item.episodes || '',
    url: item.url || '',
    notes: item.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        progress: Number(formData.progress)
      };

      // Remove empty optional fields
      Object.keys(updateData).forEach(key => {
        if (!updateData[key as keyof typeof updateData] && 
            !['progress', 'tags'].includes(key)) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      await firestoreService.updateContent(item.id!, updateData);
      onClose();
    } catch (error) {
      console.error('Error updating content:', error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  
};

export default EditContentModal;