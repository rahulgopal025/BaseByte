export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  instructor: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export interface Lecture {
  _id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  notes: string;
  order: number;
  duration: string;
  isLive: boolean;
  liveLink: string;
}

export interface Enrollment {
  _id: string;
  userId: string;
  userEmail: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolledAt: string;
}
