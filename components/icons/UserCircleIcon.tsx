
import React from 'react';
import { IconBase } from './IconBase';

export const UserCircleIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="10" r="4"></circle>
    <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
  </IconBase>
);
