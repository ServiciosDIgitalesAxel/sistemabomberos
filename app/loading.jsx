export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <img src="https://i.imgur.com/OXrrXXt.png" alt="Logo"
             className="w-12 h-12 object-contain opacity-40" />
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    </div>
  )
}