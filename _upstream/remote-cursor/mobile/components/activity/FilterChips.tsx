import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography } from '../../theme';

export type FilterOption = 'all' | 'system' | 'websocket' | 'claude-1' | 'claude-2';

interface FilterChipsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const filters: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'system', label: 'システム' },
  { key: 'websocket', label: 'WebSocket' },
  { key: 'claude-1', label: 'Claude-1' },
  { key: 'claude-2', label: 'Claude-2' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 16 }}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          onPress={() => onFilterChange(filter.key)}
          style={{
            backgroundColor: activeFilter === filter.key ? colors.accent : colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: activeFilter === filter.key ? colors.accent : colors.border,
          }}
        >
          <Text style={{
            ...typography.body,
            color: activeFilter === filter.key ? colors.background : colors.primaryText,
            fontWeight: activeFilter === filter.key ? '600' : '400',
          }}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
