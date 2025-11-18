

import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { USERS } from '../constants';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: { id: string; name: string }) => void;
}

const formElementClasses = "w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors";

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }
    if (password !== 'Hello113@') {
      setError("Invalid password.");
      return;
    }
    setError(null);
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const selectedUser = USERS.find(u => u.id === selectedUserId);
    if (selectedUser) {
        onLogin(selectedUser);
    } else {
        setError("An unexpected error occurred. Please try again.");
    }
    
    // On success, the parent will close the modal.
    setIsLoading(false);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
            <header className="p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Administrator Login</h2>
                <p className="text-sm text-slate-400">Select a user to impersonate and enter the password.</p>
            </header>
            <main className="p-6 space-y-4">
                <div>
                    <label htmlFor="user-select" className="block text-sm font-medium text-slate-300 mb-1">
                        User
                    </label>
                    <select
                        id="user-select"
                        name="user"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className={formElementClasses}
                        required
                        disabled={isLoading}
                        autoFocus
                    >
                        <option value="" disabled>-- Select a user --</option>
                        {USERS.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                     <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={formElementClasses}
                        required
                        disabled={isLoading}
                    />
                </div>
                {error && <ErrorMessage message={error} />}
            </main>
            <footer className="p-4 border-t border-slate-700">
                <button 
                    type="submit"
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Verifying...' : 'Login'}
                </button>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;