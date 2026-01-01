import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, typography } from '../../theme';

interface ResolveBlockerFormProps {
  blockerId: string;
  onSend: (instruction: string, blockerId: string) => void;
}

export const ResolveBlockerForm: React.FC<ResolveBlockerFormProps> = ({ blockerId, onSend }) => {
  const [instruction, setInstruction] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!instruction.trim()) {
      Alert.alert('エラー', '指示を入力してください');
      return;
    }

    setIsSending(true);
    try {
      onSend(instruction.trim(), blockerId);
      setInstruction('');
      Alert.alert('成功', '指示を送信しました');
    } catch (error) {
      Alert.alert('エラー', '送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    }}>
      <Text style={{ ...typography.h3, marginBottom: 12 }}>
        解決指示を送信
      </Text>

      <TextInput
        style={{
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          color: colors.primaryText,
          minHeight: 100,
          textAlignVertical: 'top',
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        placeholder="Claude Codeへの指示を入力..."
        placeholderTextColor={colors.secondaryText}
        value={instruction}
        onChangeText={setInstruction}
        multiline
        editable={!isSending}
      />

      <TouchableOpacity
        style={{
          backgroundColor: isSending ? colors.border : colors.accent,
          borderRadius: 8,
          padding: 14,
          alignItems: 'center',
        }}
        onPress={handleSend}
        disabled={isSending}
      >
        <Text style={{ ...typography.body, color: colors.background, fontWeight: '600' }}>
          {isSending ? '送信中...' : '指示を送信'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
