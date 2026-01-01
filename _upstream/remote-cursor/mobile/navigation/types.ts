import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  MainTabs: undefined;
  TrackDetail: { trackId: string };
  BlockerDetail: { blockerId?: string };
  ActivityLog: undefined;
};

// Screen props types
export type TrackDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TrackDetail'>;
export type BlockerDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'BlockerDetail'>;
export type ActivityLogScreenProps = NativeStackScreenProps<RootStackParamList, 'ActivityLog'>;

// Navigation hook type
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
