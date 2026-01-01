import React from 'react';
import { View, Text } from 'react-native';
import { Log } from '../../data/mockData';

interface LogEntryProps {
  log: Log;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const levelConfig = {
    info: {
      color: '#6c5ce7',
      label: 'INFO',
    },
    warn: {
      color: '#fdcb6e',
      label: 'WARN',
    },
    error: {
      color: '#e74c3c',
      label: 'ERROR',
    },
  };

  const config = levelConfig[log.level];

  return (
    <View className="flex-row py-2 border-b border-gray-800">
      <Text className="text-gray-500 text-xs w-16 font-mono">
        {log.timestamp}
      </Text>
      <View
        className="px-2 py-0.5 rounded mx-2"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Text
          className="text-xs font-bold"
          style={{ color: config.color }}
        >
          {config.label}
        </Text>
      </View>
      <Text className="text-gray-300 text-xs flex-1">
        {log.message}
      </Text>
    </View>
  );
};
