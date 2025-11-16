import React from 'react';
import { IconBase } from './IconBase';

export const SkipForwardIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <IconBase size={size} className={className} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M16 18h2V6h-2v12zm-11-7l8.5-6v12z"
    />
  </IconBase>
);
