
import React from 'react';
import { IconBase } from './IconBase';

export const ChevronRightIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </IconBase>
);
