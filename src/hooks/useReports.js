import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('view_dashboard_summary')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_customer_stats')
        .select('*');

      if (filters.warehouse_id) {
        query = query.eq('warehouse_id', filters.warehouse_id);
      }
      if (filters.customer_type) {
        query = query.eq('loai_khach_hang', filters.customer_type);
      }
      if (filters.care_by) {
        query = query.eq('nhan_vien_kinh_doanh', filters.care_by);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchSalespersonStats = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_salesperson_stats')
        .select('*');

      if (filters.warehouse) {
        query = query.eq('warehouse', filters.warehouse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCylinderExpiry = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_cylinder_expiry')
        .select('*');

      if (filters.kho) {
        query = query.eq('kho', filters.kho);
      }
      if (filters.min_days) {
        query = query.gte('so_ngay_ton', filters.min_days);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerExpiry = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_customer_expiry')
        .select('*');

      if (filters.kho) {
        query = query.eq('kho', filters.kho);
      }
      if (filters.min_days) {
        query = query.gte('so_ngay_chua_phat_sinh', filters.min_days);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCylinderErrors = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_cylinder_errors')
        .select('*');

      if (filters.kho) {
        query = query.eq('kho', filters.kho);
      }
      if (filters.start_date && filters.end_date) {
        query = query.gte('ngay_phat_hien_loi', filters.start_date)
                     .lte('ngay_phat_hien_loi', filters.end_date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineStats = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_machine_stats')
        .select('*');

      if (filters.kho) {
        query = query.eq('kho', filters.kho);
      }
      if (filters.machine_type) {
        query = query.eq('loai_may', filters.machine_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineSummary = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_machine_summary')
        .select('*');

      if (filters.kho) {
        query = query.eq('kho', filters.kho);
      }
      if (filters.machine_type) {
        query = query.eq('loai_may', filters.machine_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersMonthly = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_orders_monthly')
        .select('*');

      if (filters.year) {
        query = query.eq('nam', filters.year);
      }
      if (filters.month) {
        query = query.eq('thang', filters.month);
      }
      if (filters.warehouse) {
        query = query.eq('kho', filters.warehouse);
      }
      if (filters.customer_category) {
        query = query.eq('loai_khach_hang', filters.customer_category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineRevenue = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('view_machine_revenue')
        .select('*');

      if (filters.khoa) {
        query = query.eq('khoa', filters.khoa);
      }
      if (filters.nhan_vien_kinh_doanh) {
        query = query.eq('nhan_vien_kinh_doanh', filters.nhan_vien_kinh_doanh);
      }
      if (filters.loai_khach_hang) {
        query = query.eq('loai_khach_hang', filters.loai_khach_hang);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [warehousesRes, customerTypesRes, salespersonsRes, yearsRes] = await Promise.all([
        supabase.from('warehouses').select('id, name').order('name'),
        supabase.from('customers').select('customer_type').order('customer_type'),
        supabase.from('profiles').select('full_name').order('full_name'),
        supabase.rpc('get_distinct_years').catch(() => {
          const currentYear = new Date().getFullYear();
          return { data: [currentYear, currentYear - 1], error: null };
        })
      ]);

      const warehouses = warehousesRes.data || [];
      const customerTypes = [...new Set((customerTypesRes.data || []).map(r => r.customer_type).filter(Boolean))];
      const salespersons = [...new Set((salespersonsRes.data || []).map(r => r.full_name).filter(Boolean))];
      const years = yearsRes.data || [new Date().getFullYear(), new Date().getFullYear() - 1];

      return {
        warehouses,
        customerTypes,
        salespersons,
        years: [...new Set(years)].sort((a, b) => b - a)
      };
    } catch (err) {
      setError(err.message);
      return {
        warehouses: [],
        customerTypes: [],
        salespersons: [],
        years: [new Date().getFullYear()]
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchDashboardSummary,
    fetchCustomerStats,
    fetchSalespersonStats,
    fetchCylinderExpiry,
    fetchCustomerExpiry,
    fetchCylinderErrors,
    fetchMachineStats,
    fetchMachineSummary,
    fetchOrdersMonthly,
    fetchMachineRevenue,
    fetchFilterOptions
  };
};

export default useReports;
