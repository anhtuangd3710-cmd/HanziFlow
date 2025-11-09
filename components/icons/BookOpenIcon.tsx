
import React from 'react';
import { IconBase } from './IconBase';

export const BookOpenIcon: React.FC<{ size?: number; className?: string }> = (props) => (
    <IconBase {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </IconBase>
);
   