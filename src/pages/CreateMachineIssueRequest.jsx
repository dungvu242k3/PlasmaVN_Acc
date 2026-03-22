import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MachineIssueRequestForm from '../components/Machines/MachineIssueRequestForm';

const CreateMachineIssueRequest = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto font-sans min-h-screen noise-bg bg-gray-50/50">
            {/* Header / Nav - Hidden when printing */}
            <div className="mb-6 flex items-center gap-4 no-print">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 shadow-sm"
                >
                    <ArrowLeft size={18} />
                    Quay lại
                </button>
                <h1 className="text-xl font-bold text-gray-800">Tạo Đề Nghị Xuất Máy</h1>
            </div>

            {/* Main Form Component */}
            <MachineIssueRequestForm />
        </div>
    );
};

export default CreateMachineIssueRequest;
