-- Update repair_tickets table to support CSKH workflow
ALTER TABLE repair_tickets 
ADD COLUMN IF NOT EXISTS cskh_id UUID REFERENCES app_users(id);

-- Add comment for clarity
COMMENT ON COLUMN repair_tickets.cskh_id IS 'ID of the CSKH staff assigned to this ticket';
