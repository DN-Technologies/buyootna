'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@buyootna/ui'
import { ImageIcon, Store, Trash2 } from 'lucide-react'
import {
  AdminProjectRow,
  deleteProject,
  fetchUserProjects,
} from '@/lib/admin-exhibition'
import { formatArabicDate } from '@/lib/property-labels'

export default function UserExhibitionTabContent({
  userId,
}: {
  userId: string
}) {
  const [projects, setProjects] = useState<AdminProjectRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await fetchUserProjects(userId)
      setProjects(rows)
    } catch (err) {
      console.error('Failed to load user projects:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  async function handleDelete(project: AdminProjectRow) {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف مشروع "${project.title}"؟`))
      return
    try {
      await deleteProject(project.id)
      await loadProjects()
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="p-8 bg-white border border-[#ECECEC] rounded-lg text-center flex flex-col items-center justify-center gap-3 font-['Cairo'] min-h-75">
        <div className="size-12 rounded-full bg-[#F5F7F9] flex items-center justify-center text-primary">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-[18px] text-[#111111]">معرض الشركة</h3>
        <p className="text-[14px] text-[#6B6A6A] max-w-md leading-relaxed">
          يتم عرض جميع العقارات والمعروضات الخاصة بالشركة في المعرض هنا.
        </p>
      </Card>
    )
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full font-['Cairo']"
      dir="rtl"
    >
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white border border-[#ECECEC] rounded-xl overflow-hidden flex flex-col"
        >
          <div className="aspect-video bg-[#F1F5F9] flex items-center justify-center">
            {project.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.images[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-[#CBD5E1]" />
            )}
          </div>
          <div className="p-4 flex flex-col gap-2 flex-1">
            <h4 className="font-bold text-[15px] text-[#111111] line-clamp-1">
              {project.title}
            </h4>
            <p className="text-[13px] text-[#6B6A6A] leading-relaxed line-clamp-2 flex-1">
              {project.description}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#ECECEC] mt-1">
              <span className="text-[12px] text-[#6B6A6A]">
                {formatArabicDate(project.createdAt)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(project)}
                className="p-1.5 rounded-full text-[#9C1E28] hover:bg-[#FEF3F2] cursor-pointer"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
