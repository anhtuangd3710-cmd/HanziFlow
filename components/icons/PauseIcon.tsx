import React from 'react';
import { IconBase } from './IconBase';

export const PauseIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <IconBase size={size} className={className} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
    />
  </IconBase>
);
