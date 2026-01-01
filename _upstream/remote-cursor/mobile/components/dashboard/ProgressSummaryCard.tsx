import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { colors, typography } from '../../theme';

interface ProgressSummaryCardProps {
  completed: number;
  total: number;
}

/**
 * Progress Summary Card Component
 *
 * Displays overall project progress with a circular progress chart.
 * Implemented in TASK-014.
 */
export const ProgressSummaryCard: React.FC<ProgressSummaryCardProps> = ({
  completed,
  total,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ ...typography.h2, marginBottom: 20 }}>
        全体進捗
      </Text>

      {/* Circular Progress Chart */}
      <AnimatedCircularProgress
        size={160}
        width={12}
        fill={percentage}
        tintColor={colors.accent}
        backgroundColor={colors.border}
        rotation={0}
        lineCap="round"
        duration={1000}
      >
        {() => (
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 48,
                fontWeight: '700',
                color: colors.primaryText,
              }}
            >
              {percentage}%
            </Text>
            <Text
              style={{
                ...typography.label,
                color: colors.secondaryText,
                marginTop: 4,
              }}
            >
              進捗率
            </Text>
          </View>
        )}
      </AnimatedCircularProgress>

      {/* Task Counts */}
      <View style={{ marginTop: 20, width: '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text style={{ ...typography.body, color: colors.secondaryText }}>
            完了タスク
          </Text>
          <Text style={{ ...typography.body, color: colors.status.success, fontWeight: '600' }}>
            {completed} / {total}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 8,
          }}
        >
          <Text style={{ ...typography.body, color: colors.secondaryText }}>
            残りタスク
          </Text>
          <Text style={{ ...typography.body, color: colors.primaryText, fontWeight: '600' }}>
            {total - completed}
          </Text>
        </View>
      </View>
    </View>
  );
};
