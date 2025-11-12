
import React from 'react';
import { IconBase } from './IconBase';

export const TrophyIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V22h4v-7.34" />
      <path d="M12 14.66L15.46 9H8.54L12 14.66z" />
  </IconBase>
);
