import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <View
      className={`bg-[#16213e] rounded-lg p-4 mb-3 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
