

import React, { useMemo } from 'react';
import type { Project, Task } from '../types';
import Card from './Card';
import ProjectCard, { ProjectCardSkeleton } from './ProjectCard';

interface LoggedInUser {
    id: string;
    name: string;
}

interface DashboardProps {
  projects: Project[];
  allTasks: Task[];
  onSelectProject: (projectId: string) => void;
  isLoading: boolean;
  loggedInUser: LoggedInUser | null;
  onGenerateReport: () => void;
}

const SummaryCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <Card className="flex flex-col">
        <div className="flex items-center gap-3">
            <span className="flex-shrink-0 bg-slate-700 p-2 rounded-lg">{icon}</span>
            <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className="mt-3 text-sm text-slate-400 flex-1">
            {children}
        </div>
    </Card>
)

const ActionButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
    <button
        onClick={onClick}
        title={title}
        className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
    >
        {children}
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ projects, allTasks, onSelectProject, isLoading, loggedInUser, onGenerateReport }) => {
  const activeProjects = projects.filter(p => p.category === 'ACTIVE');

  const projectsWithBlockers = useMemo(() => {
    // Only consider blockers from active projects shown on the dashboard.
    const activeProjectIds = new Set(projects.filter(p => p.category === 'ACTIVE').map(p => p.ai_processid));

    const pendingTasks = allTasks.filter(task =>
      task.status === 'Pending' && task.projectId && activeProjectIds.has(task.projectId)
    );

    const blockersByProject = pendingTasks.reduce((acc, task) => {
        if (!task.projectId) return acc;

        if (!acc[task.projectId]) {
            const project = projects.find(p => p.ai_processid === task.projectId);
            acc[task.projectId] = {
                projectId: task.projectId,
                projectName: project ? project.ai_name : 'Unknown Project',
                blockerTasks: []
            };
        }
        acc[task.projectId].blockerTasks.push(task.name);
        return acc;
    }, {} as Record<string, { projectId: string; projectName: string; blockerTasks: string[] }>);

    return Object.values(blockersByProject);
  }, [allTasks, projects]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
            <div className="flex items-start justify-between">
                <div>
                     <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
                </div>
                 {loggedInUser && (
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-lg text-slate-300 flex-shrink-0">
                            Welcome, <span className="font-semibold text-white">{loggedInUser.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                             <ActionButton title="Weekly Report" onClick={onGenerateReport}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                            </ActionButton>
                            <ActionButton title="Trích Xuất Dữ Liệu từ Google Sheet" onClick={() => alert('Chức năng trích xuất dữ liệu từ Google Sheet sẽ sớm được triển khai.')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </ActionButton>
                             <ActionButton title="Đồng Bộ Dữ Liệu lên Google Sheet" onClick={() => alert('Chức năng đồng bộ dữ liệu lên Google Sheet sẽ sớm được triển khai.')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </ActionButton>
                        </div>
                    </div>
                 )}
            </div>
            <p className="mt-1 text-slate-400">A high-level overview of all ongoing initiatives.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <SummaryCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                title="Weekly Sync-Up"
            >
                <p><strong className="text-slate-300">Schedule:</strong> Tuesday & Thursday, 30 minutes</p>
                <p><strong className="text-slate-300">Purpose:</strong> Discuss progress, priorities, and any emerging issues.</p>
                <p><strong className="text-slate-300">Assigned:</strong> Chang will prepare a summary of all project data for management before each meeting.</p>
            </SummaryCard>
             <SummaryCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                title="Blockers / Pending Tasks"
            >
                {projectsWithBlockers.length > 0 ? (
                    <ul className="space-y-2 -my-1">
                        {projectsWithBlockers.map(item => (
                            <li key={item.projectId}>
                                <button 
                                    onClick={() => onSelectProject(item.projectId)} 
                                    className="text-left w-full hover:bg-slate-700/50 p-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                                >
                                    <strong className="text-slate-200 block truncate">{item.projectName}</strong>
                                    <p className="text-xs text-yellow-400 truncate">{item.blockerTasks.join(', ')}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    "The backlog is clear! No pending tasks."
                )}
            </SummaryCard>
             <SummaryCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-2.387-.477a2 2 0 01-.547-1.806l.477-2.387a6 6 0 01.517-3.86l.158-.318a6 6 0 013.86-.517l.318-.158a6 6 0 003.86-.517l2.387.477a2 2 0 011.806.547a2 2 0 01.547 1.806l-.477 2.387a6 6 0 01-.517 3.86l-.158.318a6 6 0 01-3.86.517l-.318.158a6 6 0 00-3.86.517l-2.387-.477a2 2 0 00-1.806-.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 003.86.517l.318.158a6 6 0 003.86.517l2.387-.477a2 2 0 011.806-.547a2 2 0 01.547 1.806l-.477 2.387a6 6 0 01-.517 3.86l-.158.318a6 6 0 01-3.86.517z" /></svg>}
                title="Recurring Issues / Fixes"
            >
                <p><strong className="text-slate-300">Supplier Debt Reconciliation Tool</strong></p>
                <p>To automate and simplify the supplier debt reconciliation process through AI-powered data extraction, matching, and visualization.</p>
            </SummaryCard>
        </div>

        {/* Active Projects */}
        <div>
            <h2 className="text-2xl font-semibold text-white">Active Projects</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)
                ) : (
                    activeProjects.map(project => {
                        const projectTasks = allTasks.filter(task => task.projectId === project.ai_processid);
                        return (
                            <ProjectCard 
                                key={project.ai_processid} 
                                project={project} 
                                tasks={projectTasks}
                                onSelectProject={onSelectProject} 
                            />
                        );
                    })
                )}
            </div>
            {!isLoading && activeProjects.length === 0 && (
                <div className="mt-6 text-center text-slate-400 py-16 bg-slate-900/50 rounded-lg">
                    <p>No active projects at the moment.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Dashboard;