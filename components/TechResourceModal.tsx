
import React, { useMemo, useEffect } from 'react';
import type { TechResource } from '../types';

const TechResourceModal: React.FC<{ resource: TechResource; onClose: () => void; }> = ({ resource, onClose }) => {
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

    const formattedJson = useMemo(() => {
        if (!resource.resourceJson) return null;
        try {
            const parsed = JSON.parse(resource.resourceJson);
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            return resource.resourceJson; // show as is if not valid JSON
        }
    }, [resource.resourceJson]);
    
    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">{resource.name}</h2>
                        {resource.description && <p className="text-sm text-slate-400 mt-1">{resource.description}</p>}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-full ml-4"
                        aria-label="Close resource details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto bg-slate-800/50">
                    {formattedJson ? (
                        <pre className="text-sm text-slate-300 whitespace-pre-wrap break-all">
                            <code>{formattedJson}</code>
                        </pre>
                    ) : (
                        <p className="text-slate-400">No JSON data available for this resource.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TechResourceModal;
