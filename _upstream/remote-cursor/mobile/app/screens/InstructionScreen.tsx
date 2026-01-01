import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useWebSocket } from '../../hooks/useWebSocket';

export const InstructionScreen = () => {
  const [instruction, setInstruction] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { socket, connectionStatus } = useWebSocket();

  const handleSendInstruction = () => {
    if (!instruction.trim() || !socket || connectionStatus !== 'connected') {
      return;
    }

    setIsSending(true);

    // Send instruction via WebSocket
    socket.emit('instruction', {
      type: 'instruction',
      instruction: instruction.trim(),
      timestamp: new Date().toISOString(),
    });

    // Clear input and reset state
    setInstruction('');
    setIsSending(false);
  };

  const isDisabled = !instruction.trim() || connectionStatus !== 'connected' || isSending;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#1a1a2e]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-white text-2xl font-bold mb-2">
            Send Instruction
          </Text>
          <Text className="text-gray-400 text-sm">
            Type an instruction for the PC Agent to execute
          </Text>
        </View>

        {/* Connection Status Warning */}
        {connectionStatus !== 'connected' && (
          <View className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 mb-4">
            <Text className="text-yellow-400 text-sm">
              {connectionStatus === 'connecting'
                ? '⚠️ Connecting to server...'
                : '⚠️ Not connected to server. Instructions cannot be sent.'}
            </Text>
          </View>
        )}

        {/* Instruction Input */}
        <View className="flex-1 mb-4">
          <Text className="text-gray-300 text-sm font-medium mb-2">
            Instruction
          </Text>
          <TextInput
            className="flex-1 bg-[#16213e] text-white p-4 rounded-lg"
            placeholder="e.g., Create a new React component called Button..."
            placeholderTextColor="#6b7280"
            multiline
            textAlignVertical="top"
            value={instruction}
            onChangeText={setInstruction}
            editable={!isSending}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          className={`rounded-lg p-4 items-center ${
            isDisabled ? 'bg-gray-600' : 'bg-[#6c5ce7]'
          }`}
          onPress={handleSendInstruction}
          disabled={isDisabled}
        >
          <Text className="text-white font-bold text-lg">
            {isSending ? 'Sending...' : 'Send Instruction'}
          </Text>
        </TouchableOpacity>

        {/* Instructions Counter */}
        <View className="mt-4">
          <Text className="text-gray-500 text-xs text-center">
            {instruction.length} characters
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
