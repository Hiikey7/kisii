export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'citizen' | 'officer' | 'admin';
  department?: {
    _id: string;
    name: string;
  };
  profilePicture?: string;
  isVerified: boolean;
  isActive: boolean;
  canCreateAnnouncement?: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  register: (data: any) => Promise<any>;
  updateUser: (data: Partial<User>) => void;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  reportedBy: User;
  assignedTo?: User;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  photos: Array<{
    url: string;
    uploadedAt: string;
  }>;
  updates: Array<{
    status: string;
    comment: string;
    updatedBy: User;
    photos: string[];
    timestamp: string;
  }>;
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  createdAt: string;
  resolvedAt?: string;
}

export type IssueCategory =
  | 'roads'
  | 'water'
  | 'waste'
  | 'drainage'
  | 'lighting'
  | 'health'
  | 'education'
  | 'other';

export type IssueStatus = 'pending' | 'verified' | 'assigned' | 'in_progress' | 'resolved';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Announcement {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: User;
  department?: {
    name: string;
  };
  status: 'draft' | 'published' | 'archived';
  image?: string;
  isApproved: boolean;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: NotificationType;
  issue?: string;
  title: string;
  message: string;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'issue_submitted'
  | 'issue_assigned'
  | 'status_updated'
  | 'resolved'
  | 'feedback_requested';
