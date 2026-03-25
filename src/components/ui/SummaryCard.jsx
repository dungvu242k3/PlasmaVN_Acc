import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const colorMap = {
  red: 'bg-red-500/10 text-red-500',
  green: 'bg-emerald-500/10 text-emerald-500',
  pink: 'bg-pink-500/10 text-pink-500',
  blue: 'bg-blue-500/10 text-blue-500',
  orange: 'bg-orange-500/10 text-orange-500',
  teal: 'bg-teal-500/10 text-teal-500',
  purple: 'bg-purple-500/10 text-purple-500',
  cyan: 'bg-cyan-500/10 text-cyan-500',
  amber: 'bg-amber-500/10 text-amber-500',
  slate: 'bg-slate-500/10 text-slate-500',
  gray: 'bg-gray-500/10 text-gray-500',
  yellow: 'bg-yellow-500/10 text-yellow-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  rose: 'bg-rose-500/10 text-rose-500',
};

const cardBgMap = {
  red: 'bg-red-500/5',
  green: 'bg-emerald-500/5',
  pink: 'bg-pink-500/5',
  blue: 'bg-blue-500/5',
  orange: 'bg-orange-500/5',
  teal: 'bg-teal-500/5',
  purple: 'bg-purple-500/5',
  cyan: 'bg-cyan-500/5',
  amber: 'bg-amber-500/5',
  slate: 'bg-slate-500/5',
  gray: 'bg-gray-500/5',
  yellow: 'bg-yellow-500/5',
  emerald: 'bg-emerald-500/5',
  rose: 'bg-rose-500/5',
};

export const SummaryCard = ({ title, value, icon: Icon, colorScheme, color, path }) => {
  const navigate = useNavigate();
  const theme = color || colorScheme || 'blue';

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "group bg-white rounded-xl p-4 border border-border transition-all duration-300 hover:border-primary/30 hover:shadow-sm flex items-center justify-between",
        path ? "cursor-pointer hover:-translate-y-0.5" : "cursor-default opacity-80"
      )}
    >
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[12px] text-muted-foreground font-medium mb-1 truncate">{title}</p>
        <p className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">{value}</p>
      </div>
      <div className={clsx(
        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
        colorMap[theme] || colorMap.blue
      )}>
        <Icon size={22} />
      </div>
    </div>
  );
};
export default SummaryCard;
