import React from 'react';
import { View, Text } from 'react-native';
import { ConnectionStatus } from '@common/types';
import { colors, typography } from '../../theme';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  lastUpdated: string;
}

/**
 * Dashboard Header Component
 *
 * Displays app title, connection status indicator, and last update timestamp.
 * TODO: TASK-014 - Implement full design with animated connection indicator
 */
export const Header: React.FC<HeaderProps> = ({ connectionStatus, lastUpdated }) => {
  const statusColors = {
    connected: colors.status.success,
    disconnected: colors.status.blocked,
    connecting: colors.status.inProgress,
  };

  const statusLabels = {
    connected: '接続中',
    disconnected: '切断',
    connecting: '接続中...',
  };

  return (
    <View style={{ marginBottom: 24 }}>
      {/* App Title */}
      <Text style={{ ...typography.h1, marginBottom: 8 }}>
        Remote Cursor
      </Text>

      {/* Connection Status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: statusColors[connectionStatus],
          }}
        />
        <Text style={{ ...typography.label, color: colors.secondaryText }}>
          {statusLabels[connectionStatus]}
        </Text>
        <Text style={{ ...typography.caption, color: colors.secondaryText }}>
          • {new Date(lastUpdated).toLocaleString('ja-JP')}
        </Text>
      </View>
    </View>
  );
};
