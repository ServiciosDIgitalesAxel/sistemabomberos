export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="flex flex-col min-h-full bg-[#060e1e] html-light:bg-gray-50">
      {(title || actions) && (
        <div className="hidden lg:flex items-center justify-between
                        px-6 py-5 border-b border-white/6 card-bg">
          <div>
            {title && (
              <h1 className="text-white font-semibold text-lg text-primary">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-white/40 text-sm mt-0.5 text-muted">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 px-5 py-5 lg:px-6 lg:py-6 max-w-4xl mx-auto w-full">
        {children}
      </div>
    </div>
  )
}