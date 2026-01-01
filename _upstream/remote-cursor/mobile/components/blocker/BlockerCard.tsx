import React from 'react';
import { View, Text } from 'react-native';
import { Blocker } from '@common/types';
import { colors, typography } from '../../theme';

interface BlockerCardProps {
  blocker: Blocker;
}

export const BlockerCard: React.FC<BlockerCardProps> = ({ blocker }) => {
  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.status.blocked,
    }}>
      {/* ヘッダー */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 24, marginRight: 8 }}>⚠️</Text>
        <Text style={{ ...typography.h2, flex: 1 }}>ブロッカー</Text>
      </View>

      {/* ID */}
      <Text style={{ ...typography.mono, color: colors.accent, fontSize: 12, marginBottom: 8 }}>
        {blocker.id}
      </Text>

      {/* 理由 */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ ...typography.label, color: colors.secondaryText, marginBottom: 4 }}>
          理由
        </Text>
        <Text style={{ ...typography.body, color: colors.primaryText }}>
          {blocker.reason}
        </Text>
      </View>

      {/* 影響を受けるタスク */}
      {blocker.impactedTasks && blocker.impactedTasks.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ ...typography.label, color: colors.secondaryText, marginBottom: 4 }}>
            影響を受けるタスク
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {blocker.impactedTasks.map((taskId) => (
              <View key={taskId} style={{
                backgroundColor: colors.background,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}>
                <Text style={{ ...typography.mono, color: colors.accent, fontSize: 12 }}>
                  {taskId}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 検出日時 */}
      <Text style={{ ...typography.caption, color: colors.secondaryText }}>
        検出: {new Date(blocker.blockedSince).toLocaleString('ja-JP')}
      </Text>
    </View>
  );
};
