import React from 'react';
import { View, Text } from 'react-native';
import { Track } from '@common/types';
import { colors, typography } from '../../theme';

interface TrackInfoCardProps {
  track: Track;
}

export const TrackInfoCard: React.FC<TrackInfoCardProps> = ({ track }) => {
  const statusColors = {
    active: colors.status.success,
    paused: colors.status.inProgress,
    completed: colors.status.success,
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    }}>
      {/* トラック名とステータス */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ ...typography.h1 }}>{track.name}</Text>
        <View style={{
          backgroundColor: statusColors[track.status],
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
        }}>
          <Text style={{ ...typography.caption, color: colors.background, fontWeight: '600' }}>
            {track.status === 'active' ? 'アクティブ' : track.status === 'paused' ? '一時停止' : '完了'}
          </Text>
        </View>
      </View>

      {/* 担当エージェント */}
      <Text style={{ ...typography.label, color: colors.secondaryText, marginBottom: 12 }}>
        担当: {track.agent}
      </Text>

      {/* 進捗バー */}
      <View style={{ marginBottom: 8 }}>
        <View style={{
          height: 12,
          backgroundColor: colors.border,
          borderRadius: 6,
          overflow: 'hidden',
        }}>
          <View style={{
            width: `${track.progress}%`,
            height: '100%',
            backgroundColor: colors.accent,
          }} />
        </View>
      </View>

      {/* 進捗テキスト */}
      <Text style={{ ...typography.body, color: colors.primaryText, textAlign: 'center' }}>
        {track.completedTasks} / {track.totalTasks} タスク完了 ({track.progress}%)
      </Text>
    </View>
  );
};
