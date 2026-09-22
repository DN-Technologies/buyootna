'use client'

import { FileSpreadsheet, Pencil, Trash2 } from 'lucide-react'
import type { ServiceNoteItem } from './types'

interface ServiceNotesTabProps {
  notes: ServiceNoteItem[]
  newNoteText: string
  onNewNoteTextChange: (value: string) => void
  onAddNote: () => void
  onDeleteNote: (noteId: string) => void
  onEditNote: (noteId: string, content: string) => void
}

export default function ServiceNotesTab({
  notes,
  newNoteText,
  onNewNoteTextChange,
  onAddNote,
  onDeleteNote,
  onEditNote,
}: ServiceNotesTabProps) {
  return (
    /* Notes Tab (Figma Nodes 4043:146092 & 4043:147168) */
    <div className="flex flex-col gap-6 flex-1 justify-between">
      {notes.length === 0 ? (
        /* Empty Notes Graphic (Figma Node 4043:146092) */
        <div className="flex flex-col items-center justify-center text-center py-12 gap-3 my-auto">
          <div className="size-16 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-[#6B6A6A]">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-[18px] text-[#111111]">
            لا توجد أي ملاحظات حالياً
          </h4>
          <p className="text-[13px] text-[#6B6A6A] max-w-xs leading-relaxed">
            ستظهر الملاحظات هنا فور اضافتها من المشرفين.
          </p>
        </div>
      ) : (
        /* Notes List Items (Figma Node 4043:147168) */
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2 relative shadow-xs text-right"
            >
              <div className="flex items-center justify-between">
                {note.title && (
                  <h5 className="font-bold text-[15px] text-[#111111]">
                    {note.title}
                  </h5>
                )}
                <div className="flex items-center gap-1 mr-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const updatedText = prompt('تعديل الملاحظة:', note.content)
                      if (updatedText !== null && updatedText.trim()) {
                        onEditNote(note.id, updatedText.trim())
                      }
                    }}
                    className="p-1 text-primary hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                    title="تعديل الملاحظة"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 text-[#9C1E28] hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-[13px] text-[#6B6A6A] leading-relaxed">
                {note.content}
              </p>

              <div className="text-[12px] text-[#A0A0A0] font-medium pt-1">
                {note.author} · {note.date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Form Box */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-3 shrink-0 mt-auto">
        <textarea
          value={newNoteText}
          onChange={(e) => onNewNoteTextChange(e.target.value)}
          placeholder="اكتب ملاحظة داخلية..."
          rows={3}
          className="w-full text-[13px] text-[#111111] bg-white border border-[#ECECEC] rounded-lg p-3 focus:outline-none focus:border-primary resize-none placeholder:text-[#A0A0A0]"
        />

        <div className="flex items-center gap-2 justify-start">
          <button
            type="button"
            onClick={onAddNote}
            disabled={!newNoteText.trim()}
            className={`h-10 px-5 rounded-full text-[13px] font-bold text-white transition-colors ${
              newNoteText.trim()
                ? 'bg-primary hover:bg-[#0f243a] cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            اضف الملاحظة
          </button>

          <button
            type="button"
            onClick={() => onNewNoteTextChange('')}
            className="h-10 px-5 rounded-full border border-[#ECECEC] bg-white hover:bg-slate-50 text-[#111111] text-[13px] font-bold transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
