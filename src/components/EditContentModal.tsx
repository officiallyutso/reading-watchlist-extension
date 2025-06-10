import React, { useState } from 'react';
import { firestoreService } from '../lib/firestore';
import { X } from 'lucide-react';
import type { ContentItem } from '../types';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
}



export default EditContentModal;