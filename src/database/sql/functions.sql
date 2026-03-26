CREATE OR REPLACE FUNCTION get_distinct_years()
RETURNS TABLE (data integer) 
LANGUAGE sql
AS $$
  SELECT DISTINCT EXTRACT(YEAR FROM created_at)::integer
  FROM orders
  WHERE created_at IS NOT NULL
  UNION
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::integer -- Đảm bảo luôn có ít nhất năm hiện tại
  ORDER BY 1 DESC;
$$;
