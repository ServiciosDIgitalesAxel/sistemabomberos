export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020810] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
             className="w-16 h-16 object-contain animate-pulse" />
        <div className="text-white/40 text-sm">Cargando...</div>
      </div>
    </div>
  )
}