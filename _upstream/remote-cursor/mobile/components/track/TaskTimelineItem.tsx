import React from 'react';
import { View, Text } from 'react-native';
import { Task, TaskStatus } from '@common/types';
import { colors, typography } from '../../theme';

interface TaskTimelineItemProps {
  task: Task;
  isLast: boolean;
}

export const TaskTimelineItem: React.FC<TaskTimelineItemProps> = ({ task, isLast }) => {
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done': return '✅';
      case 'in_progress': return '🟡';
      case 'blocked': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return colors.status.success;
      case 'in_progress': return colors.status.inProgress;
      case 'blocked': return colors.status.blocked;
      default: return colors.border;
    }
  };

  return (
    <View style={{ flexDirection: 'row' }}>
      {/* タイムラインライン */}
      <View style={{ width: 40, alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>{getStatusIcon(task.status)}</Text>
        {!isLast && (
          <View style={{
            width: 2,
            flex: 1,
            backgroundColor: getStatusColor(task.status),
            marginVertical: 4,
          }} />
        )}
      </View>

      {/* タスク情報 */}
      <View style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        marginLeft: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ ...typography.mono, color: colors.accent, fontSize: 12, marginRight: 8 }}>
            {task.id}
          </Text>
        </View>
        <Text style={{ ...typography.body, color: colors.primaryText }}>
          {task.title}
        </Text>
      </View>
    </View>
  );
};
