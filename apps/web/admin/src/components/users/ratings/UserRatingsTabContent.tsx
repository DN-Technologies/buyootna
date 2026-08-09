'use client'

import { useState } from 'react'
import { Star, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react'
import DeleteReviewDialog from './DeleteReviewDialog'

export interface UserReviewItem {
  id: string
  userName: string
  userAvatarInitial: string
  dateAgo: string
  comment: string
  likes: number
  dislikes: number
}

const mockReviews: UserReviewItem[] = [
  {
    id: 'rev-1',
    userName: 'أسامة الكندري',
    userAvatarInitial: 'أ',
    dateAgo: 'منذ أسبوعين',
    comment:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مدهشة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    likes: 4,
    dislikes: 0,
  },
  {
    id: 'rev-2',
    userName: 'أسامة الكندري',
    userAvatarInitial: 'أ',
    dateAgo: 'منذ أسبوعين',
    comment:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مدهشة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    likes: 4,
    dislikes: 0,
  },
  {
    id: 'rev-3',
    userName: 'أسامة الكندري',
    userAvatarInitial: 'أ',
    dateAgo: 'منذ أسبوعين',
    comment:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مدهشة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    likes: 4,
    dislikes: 0,
  },
  {
    id: 'rev-4',
    userName: 'أسامة الكندري',
    userAvatarInitial: 'أ',
    dateAgo: 'منذ أسبوعين',
    comment:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مدهشة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    likes: 4,
    dislikes: 0,
  },
]

const ratingDistribution = [
  { stars: 5, percentage: '85%' },
  { stars: 4, percentage: '60%' },
  { stars: 3, percentage: '40%' },
  { stars: 2, percentage: '25%' },
  { stars: 1, percentage: '15%' },
]

export default function UserRatingsTabContent() {
  const [reviewsList, setReviewsList] = useState<UserReviewItem[]>(mockReviews)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  if (reviewsList.length === 0) {
    /* Node 4043:133270: 0-State View */
    return (
      <div
        className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center w-full min-h-80 font-['Cairo']"
        dir="rtl"
      >
        <div className="size-16 rounded-full bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center mb-4 text-[#111111]">
          <Star className="w-7 h-7 text-[#111111]" />
        </div>
        <h3 className="text-[18px] font-bold text-[#111111] mb-2">
          لا توجد أي اراء خاصة بالمستخدم
        </h3>
        <p className="text-[14px] font-medium text-[#6B6A6A] max-w-md leading-relaxed">
          ستظهر الاراء هنا في حالة تواجدها.
        </p>
      </div>
    )
  }

  const handleDelete = () => {
    if (deleteTargetId) {
      setReviewsList((prev) =>
        prev.filter((item) => item.id !== deleteTargetId),
      )
      setDeleteTargetId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo']" dir="rtl">
      {/* Section 1: Rating Summary (Node 4043:132885) */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full text-right">
        <h3 className="text-[16px] font-bold text-[#111111]">ملخص التقييم</h3>

        <div className="flex flex-col md:flex-row items-center gap-8 w-full">
          {/* Rating Score */}
          <div className="flex flex-col items-center justify-center p-4 min-w-35">
            <div className="flex items-center gap-1">
              <span className="text-[32px] font-bold text-[#111111]">4.5</span>
              <Star className="w-7 h-7 fill-[#FFB81C] text-[#FFB81C]" />
            </div>
            <span className="text-[13px] font-medium text-[#6B6A6A] mt-1">
              100 تقييم
            </span>
          </div>

          {/* Rating Distribution Progress Bars */}
          <div className="flex flex-col gap-2 flex-1 w-full">
            {ratingDistribution.map((item) => (
              <div
                key={item.stars}
                className="flex items-center gap-3 text-[13px] font-medium text-[#6B6A6A]"
              >
                <span className="w-3 text-center shrink-0">{item.stars}</span>
                <div className="flex-1 bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#FFB81C] h-2 rounded-full transition-all duration-300"
                    style={{ width: item.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: User Reviews List */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-5 w-full text-right">
        <h3 className="text-[16px] font-bold text-[#111111]">
          آراء المستخدمين
        </h3>

        <div className="flex flex-col divide-y divide-[#ECECEC] w-full">
          {reviewsList.map((review) => (
            <div
              key={review.id}
              className="py-4 flex flex-col gap-3 first:pt-0 last:pb-0 w-full"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[15px] flex items-center justify-center shrink-0">
                    {review.userAvatarInitial}
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[14px] font-bold text-[#111111]">
                      {review.userName}
                    </span>
                    <span className="text-[12px] font-medium text-[#6B6A6A]">
                      {review.dateAgo}
                    </span>
                  </div>
                </div>

                {/* Delete Icon Button */}
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(review.id)}
                  className="size-8 flex items-center justify-center rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  title="حذف التعليق"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Comment text */}
              <p className="text-[14px] font-medium text-[#111111] leading-relaxed pr-13">
                {review.comment}
              </p>

              {/* Likes / Dislikes reactions */}
              <div className="flex items-center gap-4 pr-13 pt-1 text-[13px] font-medium text-[#6B6A6A]">
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>({review.likes})</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>({review.dislikes})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Review Dialog (Node 4043:136470) */}
      <DeleteReviewDialog
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
