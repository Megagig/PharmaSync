import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'fullWidth'> {
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ fullWidth, ...props }) => {
    return (
        <MuiButton
            fullWidth={fullWidth}
            {...props}
        />
    );
};

export default Button; 