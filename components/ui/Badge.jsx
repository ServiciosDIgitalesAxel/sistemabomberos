export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-white/10 text-white/60',
    success: 'bg-green-900/40 text-green-400',
    danger:  'bg-red-900/40 text-red-400',
    warning: 'bg-yellow-900/40 text-yellow-400',
    info:    'bg-blue-900/40 text-blue-400',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${variants[variant]}`}>
      {children}
    </span>
  )
}