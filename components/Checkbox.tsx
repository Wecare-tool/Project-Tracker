import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, className, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        name={id}
        type="checkbox"
        className={`h-4 w-4 rounded border-slate-500 bg-slate-700/50 text-cyan-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 ${className || ''}`}
        {...props}
      />
    </div>
  );
};

export default Checkbox;
