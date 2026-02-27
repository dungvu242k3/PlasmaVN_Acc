import { useEffect, useState } from 'react';
import { supabase } from '../supabase/config';

export const usePermissions = () => {
    const [permissions, setPermissions] = useState({});
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                // Giả định chúng ta lấy Role từ user hiện tại. 
                // Ở đây demo mặc định là 'Admin'
                const userRole = 'Admin';

                const { data, error } = await supabase
                    .from('app_roles')
                    .select('permissions, name')
                    .eq('name', userRole)
                    .single();

                if (!error && data) {
                    setPermissions(data.permissions || {});
                    setRole(data.name);
                }
            } catch (err) {
                console.error('Error fetching permissions hook:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    const canView = (module) => role === 'Admin' || permissions[module]?.view || false;
    const canCreate = (module) => role === 'Admin' || permissions[module]?.create || false;
    const canEdit = (module) => role === 'Admin' || permissions[module]?.edit || false;
    const canDelete = (module) => role === 'Admin' || permissions[module]?.delete || false;

    return { permissions, role, loading, canView, canCreate, canEdit, canDelete };
};

export default usePermissions;
