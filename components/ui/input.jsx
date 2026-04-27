export default function Input({ label, required, hint, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`bg-[#0d1f38] border border-white/10 rounded-lg px-3 py-2.5
                   text-white placeholder-white/25 text-sm
                   focus:outline-none focus:border-white/25
                   ${props.className || ''}`}
      />
      {hint && <span className="text-white/30 text-xs">{hint}</span>}
    </div>
  )
}