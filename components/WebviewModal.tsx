
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const WebviewModal: React.FC<{ url: string; onClose: () => void; }> = ({ url, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);

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

    // Extract title from URL if possible
    let title = 'Resource View';
    try {
        title = new URL(url).hostname;
    } catch (e) { /* ignore invalid urls */ }

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100 truncate">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-full ml-4"
                        aria-label="Close resource view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="flex-1 relative bg-slate-800">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LoadingSpinner message="Loading resource..."/>
                        </div>
                    )}
                    <iframe
                        src={url}
                        title={title}
                        className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}`}
                        onLoad={() => setIsLoading(false)}
                    />
                </main>
            </div>
        </div>
    );
};

export default WebviewModal;
