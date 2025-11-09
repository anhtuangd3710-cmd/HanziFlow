import React from 'react';
import { IconBase } from './IconBase';

export const SparkleIcon: React.FC<{ size?: number; className?: string }> = (props) => (
  <IconBase {...props}>
    <path d="M10 3L8 8l-5 2 5 2 2 5 2-5 5-2-5-2-2-5zM18 13l-2 5-5-2 5-2 2-5 2 5 5 2-5 2z"/>
  </IconBase>
);