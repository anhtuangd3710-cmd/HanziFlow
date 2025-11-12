
import React from 'react';
import { IconBase } from './IconBase';

export const AwardIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 22 12 17 17 22 15.79 13.88"></polyline>
  </IconBase>
);
