import React from 'react';
import { View, Text } from 'react-native';
import { Task } from '@common/types';
import { TaskTimelineItem } from './TaskTimelineItem';
import { colors, typography } from '../../theme';

interface TaskTimelineProps {
  tasks: Task[];
}

export const TaskTimeline: React.FC<TaskTimelineProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ ...typography.body, color: colors.secondaryText }}>
          タスクがありません
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ ...typography.h2, marginBottom: 16 }}>タスクタイムライン</Text>
      {tasks.map((task, index) => (
        <TaskTimelineItem
          key={task.id}
          task={task}
          isLast={index === tasks.length - 1}
        />
      ))}
    </View>
  );
};
