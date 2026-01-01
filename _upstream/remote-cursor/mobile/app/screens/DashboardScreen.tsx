import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useDashboardStore } from '../../stores/dashboardStore';
import { colors } from '../../theme';

// Import new dashboard components
import { Header } from '../../components/dashboard/Header';
import { ProgressSummaryCard } from '../../components/dashboard/ProgressSummaryCard';
import { TrackCard } from '../../components/dashboard/TrackCard';
import { BlockerAlert } from '../../components/dashboard/BlockerAlert';

/**
 * Dashboard Screen - Main App Screen
 *
 * Displays project overview with tracks, blockers, and overall progress.
 * Refactored in TASK-013 to use new component structure.
 */
export const DashboardScreen = () => {
  // Initialize WebSocket connection (handles all event subscriptions internally)
  useWebSocket();

  // Get data from store
  const { projectStatus, connectionStatus } = useDashboardStore();

  // Loading state
  if (!projectStatus) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.primaryText, fontSize: 18 }}>
          読み込み中...
        </Text>
        <Text style={{ color: colors.secondaryText, fontSize: 14, marginTop: 8 }}>
          サーバーに接続しています
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header with connection status */}
        <Header
          connectionStatus={connectionStatus}
          lastUpdated={projectStatus.lastUpdated}
        />

        {/* Overall Progress Summary */}
        <ProgressSummaryCard
          completed={projectStatus.completedTasks}
          total={projectStatus.totalTasks}
        />

        {/* Blocker Alert (only shown if blockers exist) */}
        {projectStatus.blockers.length > 0 && (
          <BlockerAlert count={projectStatus.blockers.length} />
        )}

        {/* Tracks Section */}
        <View style={{ marginTop: 8, marginBottom: 24 }}>
          <Text style={{ color: colors.primaryText, fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
            トラック
          </Text>
          {projectStatus.tracks.length > 0 ? (
            projectStatus.tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))
          ) : (
            <Text style={{ color: colors.secondaryText, textAlign: 'center', paddingVertical: 32 }}>
              トラックがありません
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
