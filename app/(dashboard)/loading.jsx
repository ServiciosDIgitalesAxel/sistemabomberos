export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-[#b01e1e]
                        rounded-full animate-spin" />
        <div className="text-white/40 text-xs">Cargando...</div>
      </div>
    </div>
  )
}