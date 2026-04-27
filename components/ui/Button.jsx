export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', ...props
}) {
  const variants = {
    primary:   'bg-red-700 hover:bg-red-800 text-white',
    secondary: 'bg-white/8 hover:bg-white/12 border border-white/10 text-white/70',
    danger:    'bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-400',
    success:   'bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-400',
    ghost:     'hover:bg-white/5 text-white/60 hover:text-white',
  }
  const sizes = {
    sm:  'px-3 py-1.5 text-xs rounded-lg',
    md:  'px-4 py-2.5 text-sm rounded-xl',
    lg:  'px-5 py-3 text-sm rounded-xl',
    full:'w-full px-4 py-3 text-sm rounded-xl',
  }
  return (
    <button
      {...props}
      className={`font-medium disabled:opacity-50 disabled:cursor-not-allowed
                  ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}