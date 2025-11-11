
import React from 'react';
import { IconBase } from './IconBase';

export const ChevronLeftIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </IconBase>
);
