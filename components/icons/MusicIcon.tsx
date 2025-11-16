import React from 'react';
import { IconBase } from './IconBase';

export const MusicIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => {
  return (
    <IconBase size={size} className={className}>
      <path
        fill="currentColor"
        d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm3.5-9c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.829.672-1.5 1.5-1.5s1.5.671 1.5 1.5zm-5 0c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.829.672-1.5 1.5-1.5s1.5.671 1.5 1.5z"
      />
      <path
        fill="currentColor"
        d="M11 6v5h-2V6h2zm3 0v5h-2V6h2zm-6 0v5H6V6h2z"
      />
    </IconBase>
  );
};
