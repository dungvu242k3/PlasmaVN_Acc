import { useEffect, useState } from 'react';

export const usePermissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [role, setRole] = useState(null);
    const [team, setTeam] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            // UI Template Bypass: Always default to Admin
            setPermissions([]);
            setRole('admin');
            setTeam('Admin Team');

            // Mocking User Identity for Filtering
            setUser({ id: 'u123', name: 'Nguyễn Văn Admin', department: 'Ban Giám Đốc' });
            setLoading(false);
        };

        fetchPermissions();
    }, []);

    const canView = (pageCode) => {
        // UI Template Bypass: Always allow viewing
        return true;
    };

    const canEdit = (pageCode) => {
        // UI Template Bypass: Always allow editing
        return true;
    };

    const canDelete = (pageCode) => {
        // UI Template Bypass: Always allow deleting
        return true;
    };

    return { permissions, role, team, user, loading, canView, canEdit, canDelete };
};

export default usePermissions;
