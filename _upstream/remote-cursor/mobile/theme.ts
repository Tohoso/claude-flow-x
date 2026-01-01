/**
 * Remote Cursor - Theme Constants
 *
 * このファイルはモバイルアプリケーション全体で使用するデザイントークン
 * （カラー、タイポグラフィ、スペーシング）を定数としてエクスポートします。
 *
 * @see docs/design/STYLE_GUIDE.md for specifications
 */

// =============================================================================
// Font Families
// =============================================================================

/**
 * フォントファミリー定義
 *
 * - heading: Zen Old Mincho - エヴァンゲリオン風の重厚な明朝体（見出し用）
 * - body: Noto Sans JP - 視認性の高いゴシック体（本文用）
 * - mono: JetBrains Mono - 等幅フォント（コード、タスクID、タイムスタンプ用）
 *
 * 使用前にフォントをロードする必要があります:
 * ```bash
 * npx expo install @expo-google-fonts/zen-old-mincho @expo-google-fonts/noto-sans-jp expo-font
 * ```
 */
export const fontFamilies = {
  // 見出し用 - エヴァンゲリオン風の重厚感
  heading: 'ZenOldMincho_700Bold',
  headingMedium: 'ZenOldMincho_500Medium',
  headingRegular: 'ZenOldMincho_400Regular',

  // 本文用 - 視認性重視
  body: 'NotoSansJP_400Regular',
  bodyMedium: 'NotoSansJP_500Medium',
  bodyBold: 'NotoSansJP_700Bold',

  // 等幅フォント - コード、ID、タイムスタンプ用
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

// =============================================================================
// Colors
// =============================================================================

export const colors = {
  // Primary Colors
  background: '#111827',
  surface: '#1F2937',
  primaryText: '#F9FAFB',
  secondaryText: '#9CA3AF',
  accent: '#3B82F6',

  // Status Colors
  status: {
    success: '#10B981',    // 完了、成功
    inProgress: '#F59E0B', // 進行中、警告
    blocked: '#EF4444',    // ブロック、エラー
    ready: '#6B7280',      // 開始待ち
  },

  // Semantic Colors
  border: '#374151',
  divider: '#374151',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

// =============================================================================
// Typography
// =============================================================================

export const typography = {
  // Display - 大きなヒーロータイトル（Zen Old Mincho）
  display: {
    fontFamily: fontFamilies.heading,
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    color: colors.primaryText,
  },

  // Heading 1 - 画面タイトル（Zen Old Mincho）
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: colors.primaryText,
  },

  // Heading 2 - カードタイトル、セクションヘッダー（Zen Old Mincho）
  h2: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: colors.primaryText,
  },

  // Heading 3 - サブセクション（Zen Old Mincho）
  h3: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: colors.primaryText,
  },

  // Body - メインコンテンツ（Noto Sans JP）
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: colors.primaryText,
  },

  // Body Small - 補足テキスト（Noto Sans JP）
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.secondaryText,
  },

  // Label - フィールドラベル、メタデータ（Noto Sans JP）
  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: colors.secondaryText,
  },

  // Caption - タイムスタンプ、小さな注釈（Noto Sans JP）
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.secondaryText,
  },

  // Mono - タスクID、コード、ログ（JetBrains Mono）
  mono: {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.primaryText,
  },

  // Mono Small - タイムスタンプ（JetBrains Mono）
  monoSmall: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.secondaryText,
  },
} as const;

// =============================================================================
// Spacing
// =============================================================================

export const spacing = {
  xs: 4,   // 1 unit - 小さなギャップ
  sm: 8,   // 2 units - テキスト要素間
  md: 12,  // 3 units - 小コンポーネント内
  lg: 16,  // 4 units - 標準パディング
  xl: 24,  // 6 units - ページマージン
  xxl: 32, // 8 units - 大きなセクション
} as const;

// =============================================================================
// Border Radius
// =============================================================================

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// =============================================================================
// Shadows
// =============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// =============================================================================
// Component Styles
// =============================================================================

export const components = {
  // カードスタイル
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },

  // プライマリボタン
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // セカンダリボタン
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // デンジャーボタン
  buttonDanger: {
    backgroundColor: colors.status.blocked,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // 入力フィールド
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...typography.body,
  },
} as const;

// =============================================================================
// Export Theme Object
// =============================================================================

export const theme = {
  colors,
  typography,
  fontFamilies,
  spacing,
  borderRadius,
  shadows,
  components,
} as const;

export default theme;
