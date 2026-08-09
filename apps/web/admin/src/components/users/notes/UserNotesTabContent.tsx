'use client'

import { useState } from 'react'
import { FileText, Pencil, Trash2 } from 'lucide-react'
import DeleteNoteDialog from './DeleteNoteDialog'

export interface UserNoteItem {
  id: string
  title: string
  content: string
  author: string
  dateAgo: string
}

const initialNotes: UserNoteItem[] = [
  {
    id: 'note-1',
    title: 'حذف الاعلان',
    content:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مبهرة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    author: 'نواف الجارحي',
    dateAgo: 'منذ أسبوعين',
  },
  {
    id: 'note-2',
    title: 'تعطيل حساب المستخدم',
    content:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مبهرة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    author: 'محمد المالك',
    dateAgo: 'منذ أسبوعين',
  },
  {
    id: 'note-3',
    title: 'حذف الاعلان',
    content:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مبهرة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    author: 'محمد المالك',
    dateAgo: 'منذ أسبوعين',
  },
]

export default function UserNotesTabContent() {
  const [notesList, setNotesList] = useState<UserNoteItem[]>(initialNotes)
  const [newNoteText, setNewNoteText] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const handleAddOrUpdateNote = () => {
    if (!newNoteText.trim()) return

    if (editingNoteId) {
      setNotesList((prev) =>
        prev.map((item) =>
          item.id === editingNoteId
            ? { ...item, content: newNoteText.trim() }
            : item,
        ),
      )
      setEditingNoteId(null)
    } else {
      const newNote: UserNoteItem = {
        id: `note-${Date.now()}`,
        title: 'ملاحظة جديدة',
        content: newNoteText.trim(),
        author: 'مشرف النظام',
        dateAgo: 'الآن',
      }
      setNotesList((prev) => [newNote, ...prev])
    }

    setNewNoteText('')
  }

  const handleStartEdit = (note: UserNoteItem) => {
    setEditingNoteId(note.id)
    setNewNoteText(note.content)
  }

  const handleCancel = () => {
    setNewNoteText('')
    setEditingNoteId(null)
  }

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      setNotesList((prev) => prev.filter((item) => item.id !== deleteTargetId))
      if (editingNoteId === deleteTargetId) {
        handleCancel()
      }
      setDeleteTargetId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo']" dir="rtl">
      {/* Top Section: Notes List or Empty State */}
      {notesList.length === 0 ? (
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
          {notesList.map((note) => (
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
                  {note.author} · {note.dateAgo}
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
            disabled={!newNoteText.trim()}
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
