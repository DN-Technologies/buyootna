/** One labelled value of the request, with the divider under it. */
export default function ReviewInfoField({
  label,
  value,
  divider = true,
}: {
  label: string
  value: string | null | undefined
  divider?: boolean
}) {
  return (
    <>
      <div className="flex flex-col gap-3 items-end text-right">
        <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] leading-none">
          {label}
        </span>
        <span className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal">
          {value || '—'}
        </span>
      </div>
      {divider && <div className="h-px bg-[#ECECEC] w-full" />}
    </>
  )
}
