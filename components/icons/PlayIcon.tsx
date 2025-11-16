import React from 'react';
import { IconBase } from './IconBase';

export const PlayIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <IconBase size={size} className={className} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M8 5v14l11-7z"
    />
  </IconBase>
);
