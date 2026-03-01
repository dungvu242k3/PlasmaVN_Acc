import { Eye, EyeOff, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Dropdown checkbox để bật/tắt cột hiển thị.
 *
 * @param {{ columns: Array<{key: string, label: string}>, visibleColumns: Set, onToggle: (key: string) => void, onReset: () => void, visibleCount: number, totalCount: number }} props
 */
const ColumnToggle = ({ columns, visibleColumns, onToggle, onReset, visibleCount, totalCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const allVisible = visibleCount === totalCount;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all outline-none ${isOpen
                        ? 'bg-slate-800 text-white border-slate-800 shadow-xl'
                        : allVisible
                            ? 'bg-slate-50/50 text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700 shadow-inner'
                            : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 shadow-sm'
                    }`}
                title="Chọn cột hiển thị"
            >
                <SlidersHorizontal className="w-4 h-4" />
                {!allVisible && (
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {visibleCount}/{totalCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            Cột hiển thị
                        </span>
                        {!allVisible && (
                            <button
                                onClick={onReset}
                                className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Hiện tất cả
                            </button>
                        )}
                    </div>

                    {/* Column List */}
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                        {columns.map((col) => {
                            const isVisible = visibleColumns.has(col.key);
                            return (
                                <button
                                    key={col.key}
                                    onClick={() => onToggle(col.key)}
                                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all hover:bg-slate-50 group ${isVisible ? 'text-slate-800' : 'text-slate-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isVisible
                                            ? 'bg-slate-800 border-slate-800'
                                            : 'bg-white border-slate-200 group-hover:border-slate-400'
                                        }`}>
                                        {isVisible && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold flex-1">{col.label}</span>
                                    {isVisible
                                        ? <Eye className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        : <EyeOff className="w-3.5 h-3.5 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    }
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            {visibleCount} / {totalCount} cột đang hiển thị
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnToggle;
