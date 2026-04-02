import { clsx } from 'clsx';

/**
 * Reusable View Switcher (mobile pill tabs + desktop text tabs)
 *
 * @param {string}   activeView  - Currently active view id
 * @param {Function} setActiveView - View setter
 * @param {Array}    views       - Array of { id, label, icon: ReactNode }
 * @param {string}   className   - Additional wrapper class
 */
function PageViewSwitcher({ activeView, setActiveView, views, className }) {
  return (
    <>
      {/* Mobile View Switcher */}
      <div
        className={clsx(
          'flex md:hidden items-center p-1 bg-white border border-border rounded-xl mb-4 shadow-sm',
          className
        )}
      >
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all',
              activeView === view.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-muted-foreground'
            )}
          >
            {view.icon} {view.label}
          </button>
        ))}
      </div>

      {/* Desktop View Switcher */}
      <div className="hidden md:flex items-center gap-1 mb-4 mt-6">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all',
              activeView === view.id
                ? 'bg-white text-primary shadow-sm ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {view.icon} {view.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default PageViewSwitcher;
