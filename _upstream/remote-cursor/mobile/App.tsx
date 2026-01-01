import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './navigation/BottomTabNavigator';
import { RootStackParamList } from './navigation/types';
import { TrackDetailScreen } from './screens/TrackDetailScreen';
import { BlockerDetailScreen } from './screens/BlockerDetailScreen';
import { ActivityLogScreen } from './screens/ActivityLogScreen';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useWebSocket } from './hooks/useWebSocket';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { expoPushToken, error: pushError } = usePushNotifications();
  const { socket } = useWebSocket();

  // トークンをサーバーに送信
  useEffect(() => {
    if (socket && expoPushToken) {
      socket.emit('register_push_token', { token: expoPushToken });
      console.log('[Push] Token registered with server');
    }
  }, [socket, expoPushToken]);

  // プッシュ通知エラーの表示
  useEffect(() => {
    if (pushError) {
      console.warn('[Push] Error:', pushError);
    }
  }, [pushError]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TrackDetail"
          component={TrackDetailScreen}
          options={{ title: 'トラック詳細' }}
        />
        <Stack.Screen
          name="BlockerDetail"
          component={BlockerDetailScreen}
          options={{ title: 'ブロッカー詳細' }}
        />
        <Stack.Screen
          name="ActivityLog"
          component={ActivityLogScreen}
          options={{ title: 'アクティビティログ' }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
