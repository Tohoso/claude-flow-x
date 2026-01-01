import React from 'react';
import { View, Text } from 'react-native';
import { ActivityLogEntry } from '@common/types';
import { colors, typography } from '../../theme';

interface LogEntryProps {
  log: ActivityLogEntry;
}

export const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return colors.status.blocked;
      case 'warning': return colors.status.inProgress;
      case 'info': return colors.accent;
      default: return colors.secondaryText;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'claude-1': return '🤖';
      case 'claude-2': return '🤖';
      case 'websocket': return '🔌';
      case 'system': return '⚙️';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: getLevelColor(log.level),
    }}>
      {/* ヘッダー行 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ fontSize: 14, marginRight: 4 }}>{getLevelIcon(log.level)}</Text>
        <Text style={{ fontSize: 14, marginRight: 8 }}>{getSourceIcon(log.source)}</Text>
        <Text style={{ ...typography.mono, color: colors.secondaryText, fontSize: 11 }}>
          {formatTimestamp(log.timestamp)}
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={{ ...typography.caption, color: colors.secondaryText }}>
          {log.source}
        </Text>
      </View>

      {/* メッセージ */}
      <Text style={{ ...typography.body, color: colors.primaryText }}>
        {log.message}
      </Text>
    </View>
  );
};
