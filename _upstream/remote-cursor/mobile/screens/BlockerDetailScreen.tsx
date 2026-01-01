import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { BlockerDetailScreenProps } from '../navigation/types';
import { useDashboardStore } from '../stores/dashboardStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { BlockerCard } from '../components/blocker/BlockerCard';
import { ResolveBlockerForm } from '../components/blocker/ResolveBlockerForm';
import { colors, typography } from '../theme';

export const BlockerDetailScreen: React.FC<BlockerDetailScreenProps> = ({ route }) => {
  const blockerId = route.params?.blockerId;
  const projectStatus = useDashboardStore((state) => state.projectStatus);
  const { socket } = useWebSocket();

  const blockers = projectStatus?.blockers ?? [];

  // 特定のブロッカーまたは全ブロッカーを表示
  const displayBlockers = blockerId
    ? blockers.filter(b => b.id === blockerId)
    : blockers;

  const handleSendInstruction = (instruction: string, targetBlockerId: string) => {
    if (socket) {
      socket.emit('instruction', {
        instruction,
        context: {
          blockerId: targetBlockerId,
          type: 'blocker_resolution',
        },
      });
    }
  };

  if (displayBlockers.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
        <Text style={{ ...typography.h2 }}>ブロッカーなし</Text>
        <Text style={{ ...typography.body, color: colors.secondaryText, marginTop: 8 }}>
          現在アクティブなブロッカーはありません
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ ...typography.h1, marginBottom: 16 }}>
          ブロッカー ({displayBlockers.length}件)
        </Text>

        {displayBlockers.map((blocker) => (
          <View key={blocker.id}>
            <BlockerCard blocker={blocker} />
            <ResolveBlockerForm
              blockerId={blocker.id}
              onSend={handleSendInstruction}
            />
            <View style={{ height: 24 }} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
