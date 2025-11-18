import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 p-4 rounded-md" role="alert">
      <p className="font-bold">Lỗi</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
