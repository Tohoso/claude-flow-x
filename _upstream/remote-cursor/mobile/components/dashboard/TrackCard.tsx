import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Track, TaskStatus } from '@common/types';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography } from '../../theme';

interface TrackCardProps {
  track: Track;
}

/**
 * Track Card Component
 *
 * Displays summary information for a single development track with task preview.
 * Implemented in TASK-014.
 */
export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const statusColors = {
    active: colors.status.success,
    paused: colors.status.inProgress,
    completed: colors.status.success,
  };

  const statusLabels = {
    active: 'アクティブ',
    paused: '一時停止',
    completed: '完了',
  };

  // Get status icon for task
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return '✅';
      case 'in_progress':
        return '🟡';
      case 'blocked':
        return '🔴';
      case 'not_started':
      default:
        return '⚪';
    }
  };

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Navigate to track detail
  const handlePress = () => {
    navigation.navigate('TrackDetail', { trackId: track.id });
  };

  // Get first 3 tasks for preview
  const previewTasks = track.tasks.slice(0, 3);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Track Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ ...typography.h2, flex: 1 }}>
          {track.name}
        </Text>
        <View
          style={{
            backgroundColor: statusColors[track.status],
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ ...typography.caption, color: colors.background, fontWeight: '600' }}>
            {statusLabels[track.status]}
          </Text>
        </View>
      </View>

      {/* Track Info */}
      <Text
        style={{
          ...typography.label,
          color: colors.secondaryText,
          marginBottom: 12,
        }}
      >
        担当: {track.agent}
      </Text>

      {/* Progress Bar */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            height: 8,
            backgroundColor: colors.border,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${track.progress}%`,
              height: '100%',
              backgroundColor: colors.accent,
            }}
          />
        </View>
        <Text
          style={{
            ...typography.caption,
            color: colors.secondaryText,
            marginTop: 4,
          }}
        >
          {track.completedTasks} / {track.totalTasks} タスク完了 ({track.progress}%)
        </Text>
      </View>

      {/* Task Preview List */}
      {previewTasks.length > 0 && (
        <View
          style={{
            marginTop: 8,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text
            style={{
              ...typography.label,
              color: colors.secondaryText,
              marginBottom: 8,
            }}
          >
            最近のタスク
          </Text>
          {previewTasks.map((task) => (
            <View
              key={task.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>
                {getStatusIcon(task.status)}
              </Text>
              <Text
                style={{
                  ...typography.mono,
                  color: colors.accent,
                  marginRight: 8,
                  fontSize: 12,
                }}
              >
                {task.id}
              </Text>
              <Text
                style={{
                  ...typography.body,
                  color: colors.primaryText,
                  flex: 1,
                  fontSize: 14,
                }}
                numberOfLines={1}
              >
                {task.title}
              </Text>
            </View>
          ))}
          {track.tasks.length > 3 && (
            <Text
              style={{
                ...typography.caption,
                color: colors.accent,
                marginTop: 4,
                textAlign: 'right',
              }}
            >
              他{track.tasks.length - 3}件のタスク →
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
