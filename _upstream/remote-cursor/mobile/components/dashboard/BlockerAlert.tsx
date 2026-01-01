import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography } from '../../theme';

interface BlockerAlertProps {
  count: number;
}

/**
 * Blocker Alert Component
 *
 * Warning banner that appears when there are active blockers.
 * Implemented in TASK-014.
 */
export const BlockerAlert: React.FC<BlockerAlertProps> = ({ count }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Navigate to blocker detail
  const handlePress = () => {
    navigation.navigate('BlockerDetail', {});
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.status.blocked,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {/* Warning Icon */}
        <Text style={{ fontSize: 32, marginRight: 12 }}>
          ⚠️
        </Text>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...typography.h3,
              color: colors.primaryText,
              marginBottom: 4,
            }}
          >
            ブロッカー検出
          </Text>
          <Text
            style={{
              ...typography.body,
              color: colors.primaryText,
            }}
          >
            {count}件のタスクがブロックされています
          </Text>
        </View>
      </View>

      {/* Arrow Indicator */}
      <Text
        style={{
          fontSize: 24,
          color: colors.primaryText,
          marginLeft: 12,
        }}
      >
        →
      </Text>
    </TouchableOpacity>
  );
};
