import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Task, ProductMember, UpdateTaskPayload, TaskStatus, TechResource } from '../types';
import TaskDetailModal from './TaskDetailModal';

interface TaskOverviewModalProps {
  tasks: Task[];
  onClose: () => void;
  onUpdateTask: (taskId: string, data: UpdateTaskPayload) => Promise<void>;
  accessToken: string;
  productMembers: ProductMember[];
  isAuthenticated: boolean;
  loggedInUserId: string | null;
  projectName: string;
}

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    let colorClass = 'bg-slate-800 text-slate-400 border-slate-700';
    if (priority === 'High') colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
    if (priority === 'Medium') colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (priority === 'Low') colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-semibold ${colorClass}`}>{priority}</span>;
};

const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
    return (
        <div className="h-6 w-6 rounded-full bg-slate-700 border border-slate-600 text-slate-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm" title={name}>
            {initials}
        </div>
    )
}

interface FilterOption {
    label: string;
    value: string | null;
}

const FilterDropdown: React.FC<{ 
    label: string; 
    value: string | null; 
    options: FilterOption[]; 
    onChange: (val: string | null) => void 
}> = ({ label, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === value)?.label || `All ${label}s`;
    const isActive = value !== null;

    return (
        <div className="relative" ref={containerRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border w-full sm:w-auto ${
                    isActive 
                    ? 'bg-slate-800 border-cyan-500/50 ring-1 ring-cyan-500/20' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750'
                }`}
            >
                <span className="text-slate-500 font-normal">{label}:</span> 
                <span className={`font-medium truncate flex-1 text-left ${isActive ? 'text-cyan-400' : 'text-slate-200'}`}>{selectedLabel}</span>
                <svg 
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-slate-500 group-hover:text-slate-400`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden ring-1 ring-black/20">
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt.value || 'all'}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                                    value === opt.value 
                                    ? 'bg-cyan-950/30 text-cyan-400' 
                                    : 'text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && (
                                    <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const TaskOverviewModal: React.FC<TaskOverviewModalProps> = ({ 
    tasks, 
    onClose, 
    onUpdateTask, 
    accessToken, 
    productMembers, 
    isAuthenticated,
    loggedInUserId,
    projectName
}) => {
  const [viewMode, setViewMode] = useState<'List' | 'Kanban' | 'Timeline'>('List');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterText, setFilterText] = useState('');
  
  // Filters State
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // Filter and Sort tasks based on criteria and chronological order
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(t => {
        const matchesText = t.name.toLowerCase().includes(filterText.toLowerCase()) || 
                            t.assignee?.toLowerCase().includes(filterText.toLowerCase());
        
        const matchesAssignee = filterAssignee ? t.assigneeId === filterAssignee : true;
        const matchesStatus = filterStatus ? t.status === filterStatus : true;
        const matchesPriority = filterPriority ? t.priority === filterPriority : true;

        return matchesText && matchesAssignee && matchesStatus && matchesPriority;
    });

    // Chronological Sort: End date first, then name
    return [...filtered].sort((a, b) => {
        const dateA = a.endDateRaw ? new Date(a.endDateRaw).getTime() : Infinity;
        const dateB = b.endDateRaw ? new Date(b.endDateRaw).getTime() : Infinity;
        
        if (dateA !== dateB) return dateA - dateB;
        return a.name.localeCompare(b.name);
    });
  }, [tasks, filterText, filterAssignee, filterStatus, filterPriority]);

  const handleTaskClick = (task: Task) => {
      setSelectedTask(task);
  };

  const handleUpdate = async (taskId: string, data: UpdateTaskPayload) => {
      await onUpdateTask(taskId, data);
  };

  // Filter Options
  const assigneeOptions: FilterOption[] = [
      { label: 'All Assignees', value: null },
      ...productMembers.map(m => ({ label: m.name.split('_')[0], value: m.id }))
  ];

  const statusOptions: FilterOption[] = [
      { label: 'All Statuses', value: null },
      { label: 'To Do', value: 'To Do' },
      { label: 'In Progress', value: 'In Progress' },
      { label: 'Review', value: 'Review' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Cancelled', value: 'Cancelled' },
  ];

  const priorityOptions: FilterOption[] = [
      { label: 'All Priorities', value: null },
      { label: 'High', value: 'High' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Low', value: 'Low' },
      { label: 'N/A', value: 'N/A' },
  ];

  // --- KANBAN VIEW ---
  const renderKanbanView = () => {
    const columns: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Completed', 'Pending'];
    
    return (
        <div className="flex h-full gap-4 overflow-x-auto pb-4 snap-x px-2">
            {columns.map(status => {
                const columnTasks = filteredTasks.filter(t => t.status === status);
                return (
                    <div key={status} className="flex-shrink-0 w-80 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 h-full max-h-full snap-start">
                        <div className="p-3 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-sm rounded-t-xl z-10">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    status === 'To Do' ? 'bg-slate-500' :
                                    status === 'In Progress' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' :
                                    status === 'Review' ? 'bg-purple-500' :
                                    status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}></div>
                                <h3 className="font-semibold text-slate-200 text-sm">{status}</h3>
                            </div>
                            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-slate-700">{columnTasks.length}</span>
                        </div>
                        <div className="p-2 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                            {columnTasks.map(task => (
                                <div 
                                    key={task.id}
                                    onClick={() => handleTaskClick(task)}
                                    className="p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-sm hover:border-slate-600 hover:shadow-md transition-all group flex flex-col gap-2 cursor-pointer"
                                >
                                    <p className="text-sm font-medium text-slate-200 line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug">{task.name}</p>
                                    <div className="flex justify-between items-end pt-2 mt-auto border-t border-slate-700/50">
                                        <PriorityBadge priority={task.priority} />
                                        <div className="flex items-center gap-2">
                                            {task.dueDate && (
                                                <span className={`text-[10px] ${new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                                                    {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                                </span>
                                            )}
                                            <Avatar name={task.assignee} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {columnTasks.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-24 text-slate-600 italic border border-dashed border-slate-800 rounded-lg m-1 bg-slate-800/20">
                                    <span className="text-xs">Empty</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
  };

  // --- TIMELINE VIEW ---
  const validTimelineTasks = useMemo(() => {
    return filteredTasks
        .filter(t => t.startDateRaw && t.endDateRaw && !isNaN(new Date(t.startDateRaw).getTime()) && !isNaN(new Date(t.endDateRaw).getTime()))
        .map(t => ({
            ...t,
            start: new Date(t.startDateRaw!),
            end: new Date(t.endDateRaw!)
        }));
  }, [filteredTasks]);

  const renderTimelineView = () => {
    if (validTimelineTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No tasks with valid dates to display in timeline.</p>
            </div>
        );
    }

    // Determine Range
    let minDate = new Date(Math.min(...validTimelineTasks.map(t => t.start.getTime())));
    let maxDate = new Date(Math.max(...validTimelineTasks.map(t => t.end.getTime())));
    
    // Add buffer
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const dates: Date[] = [];
    const currDate = new Date(minDate);
    while (currDate <= maxDate) {
        dates.push(new Date(currDate));
        currDate.setDate(currDate.getDate() + 1);
    }

    const DAY_WIDTH = 44; // px
    const totalWidth = dates.length * DAY_WIDTH;

    const getStatusColor = (status: TaskStatus) => {
        switch(status) {
            case 'Completed': return 'bg-emerald-600/80 border-emerald-500';
            case 'In Progress': return 'bg-cyan-600/80 border-cyan-500';
            case 'Review': return 'bg-purple-600/80 border-purple-500';
            case 'Pending': return 'bg-amber-600/80 border-amber-500';
            default: return 'bg-slate-600/80 border-slate-500';
        }
    }

    return (
        <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 overflow-auto custom-scrollbar relative bg-slate-900">
                     <div style={{ width: totalWidth + 280, minHeight: '100%' }} className="flex flex-col">
                        <div className="flex sticky top-0 z-30 bg-slate-900 border-b border-slate-800 h-[48px]">
                            <div className="sticky left-0 w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex items-center px-6 font-semibold text-xs uppercase text-slate-500 tracking-wider z-40 shadow-[4px_0_10px_rgba(0,0,0,0.2)]">
                                Task Name
                            </div>
                            <div className="flex relative z-10">
                                {dates.map((date, i) => {
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    return (
                                        <div 
                                            key={i} 
                                            className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-800/50 text-[10px] font-medium text-slate-500 ${isToday ? 'bg-cyan-900/10' : ''}`}
                                            style={{ width: DAY_WIDTH }}
                                        >
                                            <span className={isToday ? 'text-cyan-400 font-bold text-xs' : 'text-slate-400'}>{date.getDate()}</span>
                                            <span className="text-[9px] opacity-60 uppercase">{date.toLocaleDateString(undefined, {weekday: 'short'})}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex-1 py-2">
                             {validTimelineTasks.map(task => {
                                 const startDate = task.start;
                                 const endDate = task.end;
                                 const startDiff = Math.floor((startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
                                 let duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                 if (duration < 1) duration = 1;

                                 const leftPos = startDiff * DAY_WIDTH;
                                 const width = duration * DAY_WIDTH;

                                 return (
                                     <div key={task.id} className="flex h-[52px] border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors group">
                                         <div 
                                            onClick={() => handleTaskClick(task)}
                                            className="sticky left-0 w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex items-center px-6 z-20 shadow-[4px_0_10px_rgba(0,0,0,0.1)] cursor-pointer"
                                         >
                                             <div className="truncate text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors" title={task.name}>
                                                 {task.name}
                                             </div>
                                         </div>
                                         <div className="relative flex-1">
                                             <div className="absolute inset-0 flex pointer-events-none">
                                                {dates.map((d, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`flex-shrink-0 border-r border-slate-800/30 h-full ${new Date().toDateString() === d.toDateString() ? 'bg-cyan-500/5' : ''}`}
                                                        style={{ width: DAY_WIDTH }}
                                                    />
                                                ))}
                                             </div>
                                             <div 
                                                onClick={() => handleTaskClick(task)}
                                                className={`absolute top-2.5 h-8 rounded-md border shadow-sm flex items-center px-2 whitespace-nowrap overflow-hidden transition-all hover:brightness-110 hover:-translate-y-0.5 cursor-pointer ${getStatusColor(task.status)}`}
                                                style={{ 
                                                    left: leftPos + 2,
                                                    width: Math.max(width - 4, 4),
                                                }}
                                                title={`${task.name} (${task.status})\n${task.startDate} - ${task.endDateRaw?.split('T')[0]}`}
                                             >
                                                 {width > 50 && <span className="text-xs font-semibold text-white/90 drop-shadow-md truncate">{task.assignee.split(' ')[0]}</span>}
                                             </div>
                                         </div>
                                     </div>
                                 )
                             })}
                        </div>
                     </div>
                </div>
            </div>
            <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
                <span>Timeline View</span>
                <span>* Sorted chronologically. Tasks without valid dates are hidden.</span>
            </div>
        </div>
    );
  };

  // --- LIST VIEW ---
  const renderListView = () => {
      return (
        <div className="h-full overflow-hidden flex flex-col bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
            <div className="overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/90 backdrop-blur sticky top-0 z-10 text-[11px] uppercase text-slate-500 font-bold tracking-wider shadow-sm">
                        <tr>
                            <th className="px-6 py-4 border-b border-slate-800">Task Name</th>
                            <th className="px-6 py-4 border-b border-slate-800 w-56">Assignee</th>
                            <th className="px-6 py-4 border-b border-slate-800 w-40">Status</th>
                            <th className="px-6 py-4 border-b border-slate-800 w-32">Priority</th>
                            <th className="px-6 py-4 border-b border-slate-800 w-40">Due Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                        {filteredTasks.map(task => (
                            <tr 
                                key={task.id} 
                                onClick={() => handleTaskClick(task)}
                                className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4 text-slate-200 font-medium group-hover:text-cyan-400 transition-colors leading-relaxed">
                                    {task.name}
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={task.assignee} />
                                        <span className="truncate max-w-[140px] text-slate-300">{task.assignee}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        task.status === 'Completed' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 
                                        task.status === 'In Progress' ? 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20' : 
                                        task.status === 'Review' ? 'bg-purple-500/5 text-purple-400 border-purple-500/20' : 
                                        task.status === 'Pending' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' : 
                                        'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                             task.status === 'Completed' ? 'bg-emerald-400' : 
                                             task.status === 'In Progress' ? 'bg-cyan-400' : 
                                             task.status === 'Review' ? 'bg-purple-400' : 
                                             task.status === 'Pending' ? 'bg-amber-400' : 
                                             'bg-slate-400'
                                        }`}></span>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <PriorityBadge priority={task.priority} />
                                </td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                    {task.dueDate}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredTasks.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                        <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                            <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-slate-400">No tasks found</p>
                     </div>
                )}
            </div>
        </div>
      )
  }

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
        className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center backdrop-blur-sm p-2 sm:p-6"
        role="dialog"
    >
        <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col w-full lg:w-[85%] h-full max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Redesigned Header: More compact and stable layout */}
            <header className="shrink-0 bg-slate-900 border-b border-slate-800">
                <div className="px-6 py-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Branding & Title */}
                    <div className="flex items-center gap-4">
                        <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                            <svg className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">{projectName}</h2>
                            <p className="text-xs text-slate-500 font-medium">Task Explorer • <span className="text-cyan-500">{filteredTasks.length} results</span></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        {/* View Switcher */}
                        <div className="bg-slate-800 p-1 rounded-lg border border-slate-700/50 flex items-center shrink-0">
                            {(['List', 'Kanban', 'Timeline'] as const).map(mode => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                                        viewMode === mode 
                                        ? 'bg-slate-600 text-white shadow-sm ring-1 ring-white/10' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-slate-800 hidden lg:block"></div>
                        <button 
                            onClick={onClose}
                            className="ml-auto p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filter Bar: Always visible and wrapping nicely */}
                <div className="px-6 pb-4 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            type="text"
                            placeholder="Filter by name or assignee..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-1.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-600"
                        />
                    </div>
                    <FilterDropdown label="Assignee" value={filterAssignee} options={assigneeOptions} onChange={setFilterAssignee} />
                    <FilterDropdown label="Status" value={filterStatus} options={statusOptions} onChange={setFilterStatus} />
                    <FilterDropdown label="Priority" value={filterPriority} options={priorityOptions} onChange={setFilterPriority} />
                    
                    {(filterAssignee || filterStatus || filterPriority || filterText) && (
                        <button 
                            onClick={() => {
                                setFilterAssignee(null);
                                setFilterStatus(null);
                                setFilterPriority(null);
                                setFilterText('');
                            }}
                            className="text-xs text-slate-500 hover:text-cyan-400 font-medium transition-colors p-2"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-4 sm:p-6 min-h-0 bg-slate-950/20">
                {viewMode === 'List' ? renderListView() : viewMode === 'Kanban' ? renderKanbanView() : renderTimelineView()}
            </main>
        </div>

        {/* Task Detail Modal Overlay */}
        {selectedTask && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                 <TaskDetailModal 
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={handleUpdate}
                    accessToken={accessToken}
                    productMembers={productMembers}
                    loggedInUserId={loggedInUserId}
                 />
            </div>
        )}
    </div>
  );
};

export default TaskOverviewModal;