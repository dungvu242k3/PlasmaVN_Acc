import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

import { sidebarMenu } from '../../constants/sidebarMenu';
import { actionModuleGroups } from '../../constants/actionModuleData';

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 bg-white border-r border-border transition-all duration-300 flex flex-col h-full',
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-[72px]'
        )}
      >
        <div
          className={clsx(
            'h-[55px] flex items-center border-b border-border overflow-hidden shrink-0 transition-all duration-300',
            isOpen ? 'px-4' : 'justify-center'
          )}
        >
          <div
            className={clsx(
              'rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg shadow-blue-500/25',
              isOpen ? 'w-8 h-8' : 'w-10 h-10'
            )}
          >
            <Sparkles size={20} className="drop-shadow-sm" />
          </div>
          <div className={clsx('flex flex-col ml-3 whitespace-nowrap transition-opacity duration-300', !isOpen && 'opacity-0 hidden')}>
            <span className="font-bold text-[15px] leading-tight text-foreground">PlasmaVN</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Hệ thống quản lý</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar flex flex-col items-center lg:items-stretch">
          {sidebarMenu.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isOpen={isOpen}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsOpen(false);
                }
              }}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function NavItem({ item, onClick, isOpen }) {
  const location = useLocation();

  const modulePathByItemPath = Object.fromEntries(
    actionModuleGroups.flatMap((group) => group.items.map((entry) => [entry.href, group.path]))
  );

  const isParentModuleActive = modulePathByItemPath[location.pathname] === item.path;
  const itemColor = item.color || 'text-primary';
  const colorName = itemColor.replace('text-', '').split('-')[0];

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          'flex items-center rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap border-l-4',
          isOpen ? 'px-3 py-2.5 w-full justify-start' : 'w-11 h-11 justify-center',
          (isActive || isParentModuleActive)
            ? clsx('bg-slate-50 shadow-sm border-current', itemColor)
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border-transparent'
        )
      }
      title={!isOpen ? item.label : undefined}
    >
      <div 
        className={clsx(
          'flex items-center justify-center shrink-0 transition-all duration-300', 
          isOpen && 'w-5 mr-3'
        )}
      >
        <item.icon 
          size={22} 
          className={clsx(
            !isOpen && 'mt-0.5',
            (location.pathname === item.path || isParentModuleActive) ? itemColor : 'text-inherit'
          )} 
          strokeWidth={1.75} 
          style={(location.pathname === item.path || isParentModuleActive) ? {
            filter: `drop-shadow(0 0 5px currentColor)`
          } : {}}
        />
      </div>
      <span className={clsx('transition-all duration-300', !isOpen && 'opacity-0 w-0 hidden')}>
        {item.label}
      </span>
    </NavLink>
  );
}

export default Sidebar;
