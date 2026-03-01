import { useCallback, useState } from 'react';

/**
 * Hook quản lý hiển thị/ẩn cột trong bảng danh sách.
 * Lưu trạng thái vào localStorage.
 *
 * @param {string} storageKey - Key duy nhất cho mỗi trang (vd: 'columns_customers')
 * @param {Array<{key: string, label: string}>} columns - Danh sách cột
 * @returns {{ visibleColumns: Set, toggleColumn, isColumnVisible, resetColumns }}
 */
const useColumnVisibility = (storageKey, columns) => {
    const allKeys = columns.map(c => c.key);

    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return new Set(parsed.filter(k => allKeys.includes(k)));
            }
        } catch { }
        return new Set(allKeys);
    });

    const persist = useCallback((next) => {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
    }, [storageKey]);

    const toggleColumn = useCallback((key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                if (next.size <= 1) return prev;
                next.delete(key);
            } else {
                next.add(key);
            }
            persist(next);
            return next;
        });
    }, [persist]);

    const isColumnVisible = useCallback((key) => {
        return visibleColumns.has(key);
    }, [visibleColumns]);

    const resetColumns = useCallback(() => {
        const all = new Set(allKeys);
        setVisibleColumns(all);
        persist(all);
    }, [allKeys, persist]);

    const visibleCount = visibleColumns.size;
    const totalCount = allKeys.length;

    return { visibleColumns, toggleColumn, isColumnVisible, resetColumns, visibleCount, totalCount };
};

export default useColumnVisibility;
