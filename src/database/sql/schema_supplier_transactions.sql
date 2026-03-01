-- SQL Schema for PlasmaVN Supplier Transactions (Giao dịch thu/chi với Nhà cung cấp)
-- Purpose: Track payments made to suppliers for goods receipts and calculate debt.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS supplier_transactions CASCADE;

CREATE TABLE supplier_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(20) UNIQUE NOT NULL,    -- Mã phiếu chi (PC00001)
    supplier_name VARCHAR(255) NOT NULL,             -- Tên nhà cung cấp (khớp với goods_receipts)
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,        -- Số tiền giao dịch (VNĐ)
    transaction_type VARCHAR(50) NOT NULL DEFAULT 'CHI', -- Loại giao dịch (CHI = Trả tiền NCC, THU = Hoàn tiền từ NCC)
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày thanh toán
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CHUYEN_KHOAN', -- Phương thức (Tiền mặt, Chuyển khoản, Thẻ)
    note TEXT,                                       -- Nội dung/Lý do thanh toán
    created_by VARCHAR(255),                         -- Người tạo phiếu (người chi tiền)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
ALTER TABLE supplier_transactions ADD CONSTRAINT check_transaction_type CHECK (
    transaction_type IN ('THU', 'CHI')
);

ALTER TABLE supplier_transactions ADD CONSTRAINT check_payment_method CHECK (
    payment_method IN ('TIEN_MAT', 'CHUYEN_KHOAN', 'THE', 'KHAC')
);

-- Comments
COMMENT ON TABLE supplier_transactions IS 'Bảng lưu lịch sử thu/chi, thanh toán công nợ cho nhà cung cấp';
COMMENT ON COLUMN supplier_transactions.transaction_code IS 'Mã phiếu kế toán (VD: PC00001)';
COMMENT ON COLUMN supplier_transactions.amount IS 'Số tiền thực nộp/chi';
COMMENT ON COLUMN supplier_transactions.transaction_type IS 'CHI = trả tiền nợ NCC; THU = NCC hoàn tiền';
