export interface ContentItem {
  id?: string;
  title: string;
  type: 'book' | 'video' | 'article' | 'show';
  status: 'todo' | 'in-progress' | 'completed';
  progress: number;
  tags: string[];
  addedDate: string;
  author?: string;
  duration?: string;
  readTime?: string;
  episodes?: string;
  userId: string;
  url?: string;
  notes?: string;
}