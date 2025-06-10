import React, { useState } from 'react';
import { firestoreService } from '../lib/firestore';
import { X } from 'lucide-react';
import type { ContentItem } from '../types';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}



export default AddContentModal;