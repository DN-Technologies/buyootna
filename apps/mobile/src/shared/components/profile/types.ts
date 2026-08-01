export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  phone: string;
  joinedDate: string;
  role: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
}

export interface ReviewItem {
  id: string;
  userName: string;
  avatarUrl: string;
  timeAgo: string;
  rating: number;
  comment: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
}

export const SEEDED_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    userName: 'أسامة الكندري',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'منذ أسبوعين',
    rating: 5,
    comment:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مدهشة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    likes: 4,
    dislikes: 0,
  },
  {
    id: 'rev-2',
    userName: 'عبدالله المطيري',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'منذ شهر',
    rating: 5,
    comment:
      'خدمة احترافية وتواصل مميز جداً. تم إنهاء كافة المعاملات والاشتراطات في وقت قياسي وبمصداقية عالية.',
    likes: 6,
    dislikes: 0,
  },
  {
    id: 'rev-3',
    userName: 'محمد العتيبي',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'منذ شهرين',
    rating: 4,
    comment:
      'تعامل راقي ومصداقية عالية في المواعيد والمواصفات المعروضة. أنصح بالتعامل معهم.',
    likes: 2,
    dislikes: 0,
  },
  {
    id: 'rev-4',
    userName: 'سارة الهاجري',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timeAgo: 'منذ 3 أشهر',
    rating: 5,
    comment:
      'تجربة ممتازة من البداية حتى النهاية، سرعة في الرد واستجابة لجميع الاستفسارات بدقة.',
    likes: 5,
    dislikes: 1,
  },
];
