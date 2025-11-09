import React from 'react';
import { IconBase } from './IconBase';

export const UserIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </IconBase>
);
