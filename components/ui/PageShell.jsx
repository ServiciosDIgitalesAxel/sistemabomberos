export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="flex flex-col min-h-full">

      {/* Header desktop */}
      <div className="hidden lg:flex items-center justify-between
                      px-6 py-5 border-b border-white/6">
        <div>
          {title && (
            <h1 className="text-white font-semibold text-lg">{title}</h1>
          )}
          {subtitle && (
            <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>

      {/* Header mobile */}
      <div className="lg:hidden px-5 pt-5 pb-3 border-b border-white/6">
        {title && (
          <h1 className="text-white font-semibold text-base">{title}</h1>
        )}
        {subtitle && (
          <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>
        )}
        {actions && (
          <div className="mt-3 w-full">{actions}</div>
        )}
      </div>

      <div className="flex-1 px-5 py-5 lg:px-6 lg:py-6 max-w-4xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}