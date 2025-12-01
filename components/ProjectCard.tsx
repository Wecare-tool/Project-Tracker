
import React, { useMemo } from 'react';
import type { Project, Task } from '../types';
import Card from './Card';

// Helper for Priority Badge
const PriorityBadge: React.FC<{ priority: string | undefined }> = ({ priority }) => {
  if (!priority || priority === 'N/A') return null;

  const lowerPriority = priority.toLowerCase();
  let colorClasses = 'bg-slate-600 text-slate-200'; // Default
  if (lowerPriority === 'high') {
    colorClasses = 'bg-red-500/20 text-red-300 border border-red-500/50';
  } else if (lowerPriority === 'medium') {
    colorClasses = 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50';
  } else if (lowerPriority === 'low') {
    colorClasses = 'bg-green-500/20 text-green-300 border border-green-500/50';
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>
      {priority}
    </span>
  );
};

// Helper for info rows with icons
const InfoRow: React.FC<{ icon: React.ReactNode; value: React.ReactNode }> = ({ icon, value }) => (
  <div className="flex items-start gap-3">
    <span className="text-slate-500 mt-0.5">{icon}</span>
    <span className="text-sm text-slate-300">{value}</span>
  </div>
);

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, tasks, onSelectProject }) => {
  const progressPercentage = useMemo(() => {
    if (!tasks || tasks.length === 0) return 0;
    
    // Filter out Cancelled tasks from the calculation
    const validTasks = tasks.filter(t => t.status !== 'Cancelled');
    
    if (validTasks.length === 0) return 0;
    
    const completedTasks = validTasks.filter(t => t.status === 'Completed').length;
    return (completedTasks / validTasks.length) * 100;
  }, [tasks]);


  return (
    <Card className="flex flex-col h-full group">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{project.ai_name}</h3>
        <p className="mt-1 text-sm text-slate-400 line-clamp-3">{project.crdfd_description}</p>
        
        <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
            <InfoRow 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}
                value={<><span className="font-medium text-slate-400 mr-1">Requester:</span> {project.requester}</>}
            />
            <InfoRow 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
                value={<><span className="font-medium text-slate-400 mr-1">IT Staff:</span> {project.itStaff?.join(', ')}</>}
            />
             <InfoRow 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
                value={<><span className="font-medium text-slate-400 mr-1">End Date:</span> {project['crdfd_end_date@OData.Community.Display.V1.FormattedValue'] || 'N/A'}</>}
            />
             <InfoRow 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>}
                value={<div className="flex items-center gap-2"><span className="font-medium text-slate-400">Priority:</span> <PriorityBadge priority={project.crdfd_priority} /></div>}
            />
        </div>
        
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">Progress</span>
            <span className="text-xs font-semibold text-white">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-1.5">
            <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <button 
            onClick={() => onSelectProject(project.ai_processid)}
            className="w-full text-center text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-end gap-2"
        >
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </button>
      </div>
    </Card>
  );
};


export const ProjectCardSkeleton: React.FC = () => (
    <Card>
      <div className="animate-pulse">
        <div className="h-5 bg-slate-700 rounded w-3/4"></div>
        <div className="mt-3 space-y-2">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
        </div>
        <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/6"></div>
            </div>
            <div className="h-1.5 bg-slate-600 rounded-full w-full"></div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
            <div className="h-5 bg-slate-700 rounded w-1/3"></div>
        </div>
      </div>
    </Card>
  );

export default ProjectCard;
