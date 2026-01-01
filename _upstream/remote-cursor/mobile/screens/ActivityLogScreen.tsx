import React, { useState, useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useDashboardStore } from '../stores/dashboardStore';
import { FilterChips, FilterOption } from '../components/activity/FilterChips';
import { LogEntry } from '../components/activity/LogEntry';
import { ActivityLogEntry } from '@common/types';
import { colors, typography } from '../theme';

export const ActivityLogScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const logs = useDashboardStore((state) => state.logs);

  const filteredLogs = activeFilter === 'all'
    ? logs
    : logs.filter(log => log.source === activeFilter);

  const renderItem = useCallback(({ item }: { item: ActivityLogEntry }) => (
    <LogEntry log={item} />
  ), []);

  const keyExtractor = useCallback((item: ActivityLogEntry) => item.id, []);

  const ListEmptyComponent = useCallback(() => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
      <Text style={{ ...typography.h2 }}>ログなし</Text>
      <Text style={{ ...typography.body, color: colors.secondaryText, marginTop: 8 }}>
        アクティビティログはまだありません
      </Text>
    </View>
  ), []);

  const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: 16 }}>
      <Text style={{ ...typography.h1, paddingHorizontal: 16, marginBottom: 16 }}>
        アクティビティログ
      </Text>
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <Text style={{ ...typography.caption, color: colors.secondaryText, paddingHorizontal: 16, marginBottom: 8 }}>
        {filteredLogs.length}件のログ
      </Text>
    </View>
  ), [activeFilter, filteredLogs.length]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filteredLogs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        // パフォーマンス最適化
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
      />
    </View>
  );
};
