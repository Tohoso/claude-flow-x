import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { TrackDetailScreenProps } from '../navigation/types';
import { useDashboardStore } from '../stores/dashboardStore';
import { TrackInfoCard } from '../components/track/TrackInfoCard';
import { TaskTimeline } from '../components/track/TaskTimeline';
import { colors, typography } from '../theme';

export const TrackDetailScreen: React.FC<TrackDetailScreenProps> = ({ route }) => {
  const { trackId } = route.params;
  const projectStatus = useDashboardStore((state) => state.projectStatus);

  const track = projectStatus?.tracks.find(t => t.id === trackId);

  if (!track) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ ...typography.body, color: colors.secondaryText }}>
          トラックが見つかりません
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <TrackInfoCard track={track} />
        <TaskTimeline tasks={track.tasks} />
      </View>
    </ScrollView>
  );
};
