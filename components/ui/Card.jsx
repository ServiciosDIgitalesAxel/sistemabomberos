export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0a1830] border border-white/8 rounded-xl ${className}`}>
      {children}
    </div>
  )
}