import { ExternalLink, FileText } from 'lucide-react'

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i

/**
 * صورة الرخصة: the licence the company/office uploaded, as a thumbnail (an
 * image) or a file link (a PDF), opening in a new tab.
 */
export default function LicenseFilePreview({ url }: { url: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-3 items-end text-right w-full">
      <span className="font-['Cairo'] font-medium text-[14px] text-black leading-none">
        صورة الرخصة
      </span>

      {!url ? (
        <div className="border border-dashed border-[#D7D7D7] rounded-sm px-6 py-4 w-full text-center font-['Cairo'] text-[13px] text-[#6B6A6A]">
          لم تُرفق صورة الرخصة
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[#ECECEC] rounded-lg p-3 w-full flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-[#6B6A6A]" />
          <div className="flex items-center gap-3">
            <span className="font-['Cairo'] font-medium text-[13px] text-[#111111]">
              فتح الرخصة
            </span>
            <div className="size-12 rounded border border-[#ECECEC] overflow-hidden bg-white shrink-0 flex items-center justify-center">
              {IMAGE_EXT.test(url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="صورة الرخصة" className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-6 h-6 text-primary" />
              )}
            </div>
          </div>
        </a>
      )}
    </div>
  )
}
