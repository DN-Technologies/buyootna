'use client'

import { useCallback, useEffect, useState } from 'react'
import { Star, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react'
import DeleteReviewDialog from './DeleteReviewDialog'
import {
  AdminReviewRow,
  AdminReviewsSummary,
  deleteReview,
  fetchUserReviews,
  fetchUserReviewsSummary,
} from '@/lib/admin-ratings'

export default function UserRatingsTabContent({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<AdminReviewRow[]>([])
  const [summary, setSummary] = useState<AdminReviewsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [reviewsRes, summaryRes] = await Promise.all([
        fetchUserReviews(userId),
        fetchUserReviewsSummary(userId),
      ])
      setReviews(reviewsRes.data)
      setSummary(summaryRes)
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

  if (reviews.length === 0) {
    /* Node 4043:133270: 0-State View */
    return (
      <div
        className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-20 px-6 text-center w-full min-h-80 font-['Cairo']"
        dir="rtl"
      >
        <Star className="w-14 h-14 text-[#111111] stroke-[1.25] mb-4" />
        <h3 className="text-[18px] font-bold text-[#111111] mb-1">
          لا توجد أي اراء خاصة بالمستخدم
        </h3>
        <p className="text-[14px] font-medium text-[#6B6A6A] leading-relaxed">
          ستظهر الاراء هنا في حالة تواجدها.
        </p>
      </div>
    )
  }

  async function handleDelete() {
    if (!deleteTargetId) return
    try {
      await deleteReview(deleteTargetId)
      setDeleteTargetId(null)
      await load()
    } catch (err) {
      console.error('Failed to delete review:', err)
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
              <span className="text-[32px] font-bold text-[#111111]">
                {summary?.averageRating ?? 0}
              </span>
              <Star className="w-7 h-7 fill-[#FFB81C] text-[#FFB81C]" />
            </div>
            <span className="text-[13px] font-medium text-[#6B6A6A] mt-1">
              {summary?.totalRatingsCount ?? 0} تقييم
            </span>
          </div>

          {/* Rating Distribution Progress Bars */}
          <div className="flex flex-col gap-2 flex-1 w-full">
            {(summary?.ratingBreakdown ?? []).map((item) => (
              <div
                key={item.star}
                className="flex items-center gap-3 text-[13px] font-medium text-[#6B6A6A]"
              >
                <span className="w-3 text-center shrink-0">{item.star}</span>
                <div className="flex-1 bg-[#F1F5F9] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#FFB81C] h-2 rounded-full transition-all duration-300"
                    style={{ width: item.pct }}
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
          {reviews.map((review) => (
            <div
              key={review.id}
              className="py-4 flex flex-col gap-3 first:pt-0 last:pb-0 w-full"
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[15px] flex items-center justify-center shrink-0 overflow-hidden">
                    {review.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.userName.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[14px] font-bold text-[#111111]">
                      {review.userName}
                    </span>
                    <span className="text-[12px] font-medium text-[#6B6A6A]">
                      {review.timeAgo}
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

              {/* Likes / Dislikes reactions (display-only, matching that
                  these are unwired in every other review surface too) */}
              <div className="flex items-center gap-4 pr-13 pt-1 text-[13px] font-medium text-[#6B6A6A]">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4" />
                  <span>({review.likes})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ThumbsDown className="w-4 h-4" />
                  <span>({review.dislikes})</span>
                </span>
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
