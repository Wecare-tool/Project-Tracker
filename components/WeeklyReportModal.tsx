

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Task, ProductMember } from '../types';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import ReportRenderer from './ReportRenderer';
import Tabs from './Tabs';

interface WeeklyReportModalProps {
  onClose: () => void;
  productMembers: ProductMember[];
  allTasks: Task[];
  accessToken: string;
}

const formElementClasses = "w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors";

const DEPARTMENTS = ["R&D", "Sale", "Sourcing", "Logistic", "HR", "Accounting", "Finance"];

const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ onClose, productMembers, allTasks, accessToken }) => {
  const [assigneeId, setAssigneeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('R&D');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState('Copy All');
  const [activeTab, setActiveTab] = useState<'Preview' | 'Edit'>('Preview');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
  }

  const handleGenerateReport = useCallback(async () => {
    if (!assigneeId || !startDate || !endDate) {
      setError("Please select an assignee and the report period.");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setReportContent('');

    try {
        const selectedAssignee = productMembers.find(pm => pm.id === assigneeId);
        if (!selectedAssignee) {
            throw new Error("Selected assignee not found.");
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filteredTasks = allTasks.filter(task => {
            if (task.assigneeId !== assigneeId || task.status !== 'Completed') {
                return false;
            }
            const taskEnd = task.endDateRaw ? new Date(task.endDateRaw) : null;
            if (!taskEnd) {
                return false;
            }
            return taskEnd >= start && taskEnd <= end;
        });

        // Sort tasks chronologically by end date
        const sortedTasks = filteredTasks.sort((a, b) => {
            const dateA = a.endDateRaw ? new Date(a.endDateRaw).getTime() : 0;
            const dateB = b.endDateRaw ? new Date(b.endDateRaw).getTime() : 0;
            return dateA - dateB;
        });

        if (sortedTasks.length === 0) {
            setReportContent("<h1>Báo Cáo Công Việc Đã Hoàn Thành</h1><div class='report-meta'><p>No completed tasks found for the selected user and period.</p></div>");
            setIsLoading(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const formattedTasks = sortedTasks.map(t => ({
            QuyTrinh: t.project,
            CongViec: t.name,
            MoTa: t.description.replace(/<[^>]*>/g, ' '), // Strip HTML tags for cleaner processing
        }));
        
        const reportTime = `${formatDate(startDate)} – ${formatDate(endDate)}`;
        const assigneeName = selectedAssignee.name?.split('_')[0] || selectedAssignee.name || 'N/A';

        const prompt = `
            Bạn là một trợ lý quản lý dự án chuyên nghiệp. Dựa vào danh sách các công việc ĐÃ HOÀN THÀNH dưới dạng JSON sau đây, hãy tạo một "BÁO CÁO CÔNG VIỆC ĐÃ HOÀN THÀNH" bằng tiếng Việt. Trả về kết quả dưới dạng một chuỗi **HTML thuần túy**.

            **Dữ liệu công việc (JSON) - ĐÃ ĐƯỢC SẮP XẾP THEO THỨ TỰ THỜI GIAN HOÀN THÀNH:**
            ${JSON.stringify(formattedTasks)}

            **Thông tin báo cáo:**
            - Người thực hiện: ${assigneeName}
            - Thời gian: ${reportTime}
            - Phòng ban: ${department}

            **Yêu cầu định dạng đầu ra (HTML) - Theo đúng mẫu:**
            - Toàn bộ kết quả phải là một chuỗi HTML. **KHÔNG** bao gồm \`\`\`html, \`<html>\`, \`<head>\` hoặc \`<body>\`. Chỉ trả về nội dung sẽ nằm bên trong thẻ body.
            - KHÔNG SỬ DỤNG MARKDOWN.

            - **Tiêu đề chính:** Bắt đầu bằng thẻ \`<h1>BÁO CÁO CÔNG VIỆC TUẦN</h1>\`.
            - **Thông tin báo cáo (Meta):**
                - Gói gọn thông tin "Người thực hiện", "Thời gian", và "Phòng ban" trong một thẻ \`<div>\` với class là \`"report-meta"\`.
                - Bên trong div đó, mỗi thông tin là một thẻ \`<p>\` với nhãn được bọc trong thẻ \`<strong>\`.
                - Ví dụ: \`<p><strong>Người thực hiện:</strong> ${assigneeName}</p>\`

            - **Cấu trúc nội dung:**
                1.  Tiêu đề "1. Tổng kết các công việc đã hoàn thành" dùng thẻ \`<h2>\`. Dưới đó là một danh sách \`<ul>\` với các \`<li>\` **tổng hợp cực ngắn gọn, tập trung các ý chính** các kết quả chính đã đạt được từ các công việc.
                2.  Tiêu đề "2. Phân tích chi tiết" dùng thẻ \`<h2>\`. Dưới đó là một bảng \`<table>\`.

            - **Yêu cầu cho bảng HTML chi tiết:**
                - Tiêu đề các cột trong \`<thead>\`: "Quy trình", "Công việc hoàn thành", "Khó khăn", "Kế hoạch tiếp theo".
                - **GOM NHÓM DỮ LIỆU THEO "Quy trình".**
                - Đối với mỗi "Quy trình" duy nhất trong dữ liệu:
                    - Tạo **MỘT HÀNG \`<tr>\` duy nhất**.
                    - Ô \`<td>\` cho "Quy trình" chứa tên quy trình.
                    - Ô \`<td>\` cho "Công việc hoàn thành" **phải chứa một danh sách \`<ul>\` lồng nhau**. Mỗi \`<li>\` trong danh sách này là một công việc ("CongViec") thuộc về quy trình đó. **QUAN TRỌNG: Giữ nguyên thứ tự các công việc** như đã cung cấp trong JSON đầu vào.
                    - Suy luận và điền nội dung **ngắn gọn, tổng hợp, chuyên nghiệp** cho cột "Khó khăn" và "Kế hoạch tiếp theo" dựa trên mô tả công việc.
                      - **Đối với cột "Khó khăn":** Mô tả ngắn gọn các khó khăn trong quá trình implement, tập trung vào các vấn đề kỹ thuật, tích hợp dữ liệu, tối ưu hiệu suất. Nếu không có, ghi "Không có".
                      - **Đối với cột "Kế hoạch tiếp theo":** Đề xuất các bước tiếp theo một cách hợp lý. Nếu công việc đã xong và không có bước tiếp, ghi "Hoàn tất".
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        let content = response.text;
        // Clean up potential markdown code fences that the AI might add
        content = content.replace(/^```html\s*/, '').replace(/```\s*$/, '');
        setReportContent(content.trim());
        setActiveTab('Preview');

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while generating the report.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [assigneeId, startDate, endDate, department, allTasks, productMembers]);
  
  const handleCopy = async () => {
    if (reportContent) {
        try {
            // The ClipboardItem API allows writing rich text (HTML) to the clipboard.
            const blob = new Blob([reportContent], { type: 'text/html' });
            const clipboardItem = new ClipboardItem({ 'text/html': blob });
            await navigator.clipboard.write([clipboardItem]);
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy All'), 2000);
        } catch (err) {
            console.error('Failed to copy rich text: ', err);
            // Fallback for older browsers
            try {
                await navigator.clipboard.writeText(reportContent);
                 setCopyButtonText('Copied (Plain Text)!');
                 setTimeout(() => setCopyButtonText('Copy All'), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed: ', fallbackErr);
                alert('Could not copy content. Please try copying manually.');
            }
        }
    }
  };


  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[80vw] h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Generate Weekly Report</h2>
             <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full ml-4"
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </header>
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
            {/* Settings Panel */}
            <div className="lg:col-span-1 bg-slate-800 p-4 rounded-lg flex flex-col space-y-4">
                 <div>
                    <label htmlFor="assigneeId" className="block text-sm font-medium text-slate-300 mb-1">
                        Assignee <span className="text-red-400">*</span>
                    </label>
                    <select
                        id="assigneeId"
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className={formElementClasses}
                    >
                        <option value="" disabled>-- Select user --</option>
                        {productMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.name?.split('_')[0] || member.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        Report Period <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                         <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={formElementClasses}
                         />
                         <span>-</span>
                         <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={formElementClasses}
                         />
                    </div>
                </div>
                 <div>
                    <label htmlFor="department" className="block text-sm font-medium text-slate-300 mb-1">
                        Department
                    </label>
                    <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className={formElementClasses}
                    >
                        {DEPARTMENTS.map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-auto">
                    {error && <ErrorMessage message={error}/>}
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                        className="w-full mt-2 px-4 py-2 rounded-md text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Report Panel */}
            <div className="lg:col-span-3 bg-slate-800 p-4 rounded-lg flex flex-col min-h-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner message="AI is generating the report..."/>
                    </div>
                ) : reportContent ? (
                    <>
                        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                             <Tabs tabs={['Preview', 'Edit']} activeTab={activeTab} onTabClick={(tab) => setActiveTab(tab as 'Preview' | 'Edit')} />
                            <button onClick={handleCopy} className="px-3 py-1 text-sm rounded-md bg-slate-600 hover:bg-slate-500 text-white transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 5a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2h-6a2 2 0 01-2-2V5z" /><path d="M4 3a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2H4z" /></svg>
                                {copyButtonText}
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto">
                           {activeTab === 'Preview' ? (
                                <div className="p-2">
                                    <ReportRenderer content={reportContent} />
                                </div>
                           ) : (
                                <textarea
                                    value={reportContent}
                                    onChange={(e) => setReportContent(e.target.value)}
                                    className="w-full h-full p-2 bg-slate-900 text-slate-300 border border-slate-700 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    aria-label="Edit report content"
                                />
                           )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Please select settings and generate a report to see the preview here.</p>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default WeeklyReportModal;
