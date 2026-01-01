/**
 * Remote Cursor - Font Loader Utility
 *
 * このファイルはアプリ起動時にカスタムフォントをロードするための
 * ユーティリティ関数を提供します。
 *
 * @see docs/design/STYLE_GUIDE.md for font specifications
 */

import * as Font from 'expo-font';
import {
  ZenOldMincho_400Regular,
  ZenOldMincho_500Medium,
  ZenOldMincho_700Bold,
} from '@expo-google-fonts/zen-old-mincho';
import {
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
} from '@expo-google-fonts/noto-sans-jp';

/**
 * カスタムフォントをロードする
 *
 * App.tsx で使用:
 * ```tsx
 * import { loadFonts } from './utils/fonts';
 *
 * export default function App() {
 *   const [fontsLoaded] = useFonts(loadFonts());
 *
 *   if (!fontsLoaded) {
 *     return <AppLoading />;
 *   }
 *
 *   return <MainApp />;
 * }
 * ```
 */
export const customFonts = {
  // Zen Old Mincho - 見出し用（エヴァンゲリオン風）
  ZenOldMincho_400Regular,
  ZenOldMincho_500Medium,
  ZenOldMincho_700Bold,

  // Noto Sans JP - 本文用（視認性重視）
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,

  // JetBrains Mono - 等幅フォント（コード、ID用）
  // Note: JetBrains Monoは別途インストールが必要
  // npx expo install @expo-google-fonts/jetbrains-mono
};

/**
 * フォントロード用のフック
 *
 * 使用例:
 * ```tsx
 * import { useFonts } from 'expo-font';
 * import { customFonts } from './utils/fonts';
 *
 * const [fontsLoaded] = useFonts(customFonts);
 * ```
 */
export const loadFonts = async (): Promise<void> => {
  await Font.loadAsync(customFonts);
};

/**
 * フォントがロードされているかチェック
 */
export const areFontsLoaded = (): boolean => {
  return (
    Font.isLoaded('ZenOldMincho_700Bold') &&
    Font.isLoaded('NotoSansJP_400Regular')
  );
};

export default customFonts;
