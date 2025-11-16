import React from 'react';
import { IconBase } from './IconBase';

export const SkipBackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <IconBase size={size} className={className} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M6 6h2v12H6V6zm3.5 6l8.5 6V6z"
    />
  </IconBase>
);
