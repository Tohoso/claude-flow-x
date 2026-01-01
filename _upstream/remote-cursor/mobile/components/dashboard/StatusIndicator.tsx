import React from 'react';
import { View, Text } from 'react-native';

interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      textColor: 'text-green-500',
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      textColor: 'text-red-500',
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting...',
      textColor: 'text-yellow-500',
    },
  };

  const config = statusConfig[status];

  return (
    <View className="flex-row items-center">
      <View className={`w-2 h-2 rounded-full ${config.color} mr-2`} />
      <Text className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </Text>
    </View>
  );
};
