import React from 'react';

interface ReportRendererProps {
  content: string;
}

const ReportRenderer: React.FC<ReportRendererProps> = ({ content }) => {
  return <div className="report-content" dangerouslySetInnerHTML={{ __html: content }} />;
};

export default ReportRenderer;