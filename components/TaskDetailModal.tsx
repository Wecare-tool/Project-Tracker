

import React, { useState, useEffect } from 'react';
import type { Task, UpdateTaskPayload, TaskStatus, TaskPriority, ProductMember } from '../types';
import ErrorMessage from './ErrorMessage';
import HtmlRenderer from './HtmlRenderer';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onSave: (taskId: string, data: UpdateTaskPayload) => Promise<void>;
  accessToken: string;
  productMembers: ProductMember[];
}

const formElementClasses = "w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors";

const formatDateForInput = (dateString?: string): string => {
  if (!dateString || dateString === 'N/A') return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onSave, accessToken, productMembers }) => {
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description,
    startDate: formatDateForInput(task.startDateRaw),
    endDate: formatDateForInput(task.endDateRaw),
    assigneeId: task.assigneeId || '',
    status: task.status,
    priority: task.priority,
    proofOfComplete: task.proofOfComplete || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<null | 'description' | 'proofOfComplete'>(null);

  useEffect(() => {
    setFormData({
      name: task.name,
      description: task.description,
      startDate: formatDateForInput(task.startDateRaw),
      endDate: formatDateForInput(task.endDateRaw),
      assigneeId: task.assigneeId || '',
      status: task.status,
      priority: task.priority,
      proofOfComplete: task.proofOfComplete || '',
    });
     // Reset editing field when task changes
    setEditingField(null);
  }, [task]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>, fieldName: 'description' | 'proofOfComplete') => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (!blob) continue;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Image = event.target?.result as string;
                // Wrap in a paragraph tag for better rich text compatibility
                const imgTag = `<p><img src="${base64Image}" alt="pasted image" /></p>`;

                const textarea = e.target as HTMLTextAreaElement;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const currentValue = textarea.value;
                const newValue = currentValue.substring(0, start) + imgTag + currentValue.substring(end);

                setFormData(prev => ({ ...prev, [fieldName]: newValue }));
            };
            reader.readAsDataURL(blob);

            e.preventDefault(); // Prevent default paste behavior
            return;
        }
    }
  };

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onSave(task.id, {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        assigneeId: formData.assigneeId,
        status: formData.status as TaskStatus,
        priority: formData.priority as TaskPriority,
        proofOfComplete: formData.proofOfComplete
      });
      onClose();
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // No confirmation needed as per user request to fix sandbox issue.
    setError(null);
    setIsLoading(true);
    try {
        await onSave(task.id, { status: 'Cancelled' });
        onClose();
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Failed to deactivate the task.');
    } finally {
        setIsLoading(false);
    }
  };

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

  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <div 
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                 <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-xl font-bold text-slate-100 focus:outline-none placeholder-slate-500"
                    placeholder="Task Name"
                />
                
                <button 
                    onClick={onClose} 
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-full ml-4"
                    aria-label="Close task details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>
            
            <main className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column for major text areas */}
                <div className="md:col-span-2 space-y-4">
                     <div>
                        <label htmlFor="task-description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                        {editingField === 'description' ? (
                            <textarea
                                id="task-description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                onPaste={(e) => handlePaste(e, 'description')}
                                rows={10}
                                className={formElementClasses}
                                autoFocus
                                onBlur={() => setEditingField(null)}
                            />
                        ) : (
                            <div 
                                onClick={() => setEditingField('description')}
                                className="w-full bg-slate-800 border border-dashed border-slate-600 hover:border-solid hover:border-cyan-500 rounded-md p-2 min-h-[220px] max-h-[400px] overflow-y-auto cursor-pointer transition-colors"
                            >
                                {formData.description ? (
                                    <HtmlRenderer htmlString={formData.description} accessToken={accessToken} /> 
                                ) : (
                                    <span className="text-slate-500 italic">Click to add a description...</span>
                                )}
                            </div>
                        )}
                    </div>
                     <div>
                        <label htmlFor="proof-of-complete" className="block text-sm font-medium text-slate-300 mb-1">Proof of Complete</label>
                         {editingField === 'proofOfComplete' ? (
                            <textarea
                                id="proof-of-complete"
                                name="proofOfComplete"
                                value={formData.proofOfComplete}
                                onChange={handleInputChange}
                                onPaste={(e) => handlePaste(e, 'proofOfComplete')}
                                rows={5}
                                className={formElementClasses}
                                autoFocus
                                onBlur={() => setEditingField(null)}
                            />
                        ) : (
                            <div 
                                onClick={() => setEditingField('proofOfComplete')}
                                className="w-full bg-slate-800 border border-dashed border-slate-600 hover:border-solid hover:border-cyan-500 rounded-md p-2 min-h-[120px] max-h-[300px] overflow-y-auto cursor-pointer transition-colors"
                            >
                                {formData.proofOfComplete ? (
                                    <HtmlRenderer htmlString={formData.proofOfComplete} accessToken={accessToken} />
                                ) : (
                                    <span className="text-slate-500 italic">Click to add proof of completion...</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column for metadata */}
                <div className="md:col-span-1 space-y-4">
                     <div>
                        <label htmlFor="assigneeId" className="block text-sm font-medium text-slate-300 mb-1">Assignee</label>
                        <select
                            id="assigneeId"
                            name="assigneeId"
                            value={formData.assigneeId}
                            onChange={handleInputChange}
                            className={formElementClasses}
                        >
                            <option value="">Unassigned</option>
                            {productMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name?.split('_')[0] || member.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={formElementClasses}
                        >
                            <option>To Do</option>
                            <option>In Progress</option>
                            <option>Review</option>
                            <option>Completed</option>
                            <option>Pending</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className={formElementClasses}
                        >
                            <option>N/A</option>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                        <input
                            type="date"
                            id="start-date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className={formElementClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                        <input
                            type="date"
                            id="end-date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className={formElementClasses}
                        />
                    </div>
                    {task.techResource && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Technical Resource</label>
                            <div className="bg-slate-800 border border-slate-600 rounded-md p-3 space-y-2 text-sm">
                                <p><strong className="text-slate-400">Name:</strong> <span className="text-white">{task.techResource.name}</span></p>
                                {task.techResource.type && <p><strong className="text-slate-400">Type:</strong> <span className="text-white">{task.techResource.type}</span></p>}
                                {task.techResource.version && <p><strong className="text-slate-400">Version:</strong> <span className="text-white">{task.techResource.version}</span></p>}
                                {task.techResource.description && <p className="mt-1 text-slate-300">{task.techResource.description}</p>}
                                {task.techResource.resourceLink && (
                                    <p className="mt-2">
                                        <a href={task.techResource.resourceLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1">
                                            View Resource
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                            </svg>
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-4 border-t border-slate-700 flex justify-between items-center flex-shrink-0">
                <div>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-md text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors disabled:text-slate-500 disabled:hover:bg-transparent"
                    >
                        Deactivate Task
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    {error && <ErrorMessage message={error}/>}
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-600 hover:bg-slate-500 text-slate-200 transition-colors">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default TaskDetailModal;