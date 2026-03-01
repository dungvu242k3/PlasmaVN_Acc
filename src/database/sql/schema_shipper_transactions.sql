-- SQL Schema for Shipper Transactions
-- Bảng lưu trữ lịch sử Thanh toán Cước phí cho Đơn vị vận chuyển (Shipper)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS shipper_transactions CASCADE;

CREATE TABLE shipper_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL, -- Mã giao dịch (VD: PC00001 - Phiếu Chi trả cước rỗng)
    shipper_id UUID REFERENCES shippers(id) ON DELETE SET NULL, -- Liên kết đến Đơn vị vận chuyển
    shipper_name VARCHAR(255) NOT NULL, -- Lưu cứng tên để truy vấn nhanh và giữ lịch sử
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0, -- Số tiền giao dịch cước phí
    transaction_type VARCHAR(20) NOT NULL, -- 'CHI' (Công ty trả tiền cước) hoặc 'THU' (Thu lại tiền cước do đối soát sai)
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày thực hiện giao dịch
    payment_method VARCHAR(50) NOT NULL, -- CHUYEN_KHOAN, TIEN_MAT, KHAC
    note TEXT, -- Ghi chú (VD: Thanh toán tiền cước tháng 10)
    
    created_by VARCHAR(255), -- User thực hiện (Kế toán)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Constraints
ALTER TABLE shipper_transactions ADD CONSTRAINT check_shipper_tx_type CHECK (
    transaction_type IN ('THU', 'CHI')
);

ALTER TABLE shipper_transactions ADD CONSTRAINT check_shipper_payment_method CHECK (
    payment_method IN ('CHUYEN_KHOAN', 'TIEN_MAT', 'KHAC')
);

-- Comments
COMMENT ON TABLE shipper_transactions IS 'Lịch sử giao dịch Thanh toán cước Vận chuyển';
COMMENT ON COLUMN shipper_transactions.transaction_type IS 'CHI = Trả cước phí cho Shipper; THU = Thu lại tiền do lỗi/đối soát';
COMMENT ON COLUMN shipper_transactions.payment_method IS 'Phương thức thanh toán';
