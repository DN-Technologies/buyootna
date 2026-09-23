'use client'

import { useCallback, useEffect, useState } from 'react'
import { FileText, Pencil, Trash2 } from 'lucide-react'
import DeleteNoteDialog from './DeleteNoteDialog'
import {
  AdminNoteRow,
  createNote,
  deleteNote,
  fetchUserNotes,
  updateNote,
} from '@/lib/admin-notes'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'

export default function UserNotesTabContent({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<AdminNoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [newNoteText, setNewNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await fetchUserNotes(userId)
      setNotes(rows)
    } catch (err) {
      console.error('Failed to load notes:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  async function handleAddOrUpdateNote() {
    if (!newNoteText.trim() || submitting) return
    setSubmitting(true)
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, newNoteText.trim())
        setEditingNoteId(null)
      } else {
        await createNote(userId, { content: newNoteText.trim() })
      }
      setNewNoteText('')
      await load()
    } catch (err) {
      console.error('Failed to save note:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function handleStartEdit(note: AdminNoteRow) {
    setEditingNoteId(note.id)
    setNewNoteText(note.content)
  }

  function handleCancel() {
    setNewNoteText('')
    setEditingNoteId(null)
  }

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return
    try {
      await deleteNote(deleteTargetId)
      if (editingNoteId === deleteTargetId) {
        handleCancel()
      }
      setDeleteTargetId(null)
      await load()
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo']" dir="rtl">
      {/* Top Section: Notes List or Empty State */}
      {notes.length === 0 ? (
        /* Empty State View */
        <div className="bg-white border border-[#ECECEC] rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center w-full min-h-50">
          <div className="flex flex-col items-center gap-1.5 mb-3">
            <FileText className="w-14 h-14 text-[#111111] stroke-[1.25]" />
            <div className="w-14 h-1 bg-[#8B8B8B] rounded-full opacity-30" />
          </div>
          <h3 className="text-[16px] font-bold text-[#111111] mb-1">
            لا توجد أي ملاحظات حاليا
          </h3>
          <p className="text-[14px] font-semibold text-[#6B6A6A] max-w-82.5 leading-relaxed">
            ستظهر الملاحظات هنا فور اضافتها من المشرفين.
          </p>
        </div>
      ) : (
        /* Populated Notes List */
        <div className="flex flex-col gap-3.5 w-full max-h-95 overflow-y-auto pl-1 pr-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-3 text-right w-full transition-all hover:border-[#D4D4D4]"
            >
              <div className="flex items-start justify-between gap-4 w-full">
                {/* Title and Content (Right side in RTL) */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <h4 className="text-[16px] font-medium text-[#111111] leading-snug">
                    {note.title}
                  </h4>
                  <p className="text-[14px] font-normal text-[#6B6A6A] leading-relaxed tracking-[-0.408px]">
                    {note.content}
                  </p>
                </div>
                {/* Actions (Left side in RTL) */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(note)}
                    title="تعديل الملاحظة"
                    className="p-1.5 rounded-lg text-[#6B6A6A] hover:text-[#111111] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(note.id)}
                    title="حذف الملاحظة"
                    className="p-1.5 rounded-lg text-[#BA0003] hover:text-[#9C1E28] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Author & Timestamp */}
              <div className="flex items-center text-[13px] font-normal text-[#6B6A6A]">
                <span>
                  {note.authorAdmin?.name || 'مشرف النظام'} ·{' '}
                  {formatRelativeArabicTime(note.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Internal Note Input Form */}
      <div className="flex flex-col gap-3 w-full">
        <div className="bg-[#FEFEFE] border border-[#ECECEC] rounded-lg p-4 flex flex-col gap-2 w-full focus-within:border-primary transition-colors">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="اكتب ملاحظة داخلية...."
            rows={4}
            className="w-full bg-transparent text-[14px] font-normal text-[#111111] placeholder:text-[#979797] focus:outline-none resize-none leading-relaxed tracking-[-0.408px]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={!newNoteText.trim() || submitting}
            onClick={handleAddOrUpdateNote}
            className="bg-primary text-white font-bold text-[14px] px-6 py-2.5 rounded-2xl hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingNoteId ? 'تحديث الملاحظة' : 'أضف الملاحظة'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-white border border-[#E2E8F0] text-[#111111] font-bold text-[14px] px-6 py-2.5 rounded-2xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteNoteDialog
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
