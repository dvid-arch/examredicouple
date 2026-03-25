import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  includeTabInset?: boolean;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
};

export function AppScreen({
  children,
  scroll = true,
  contentContainerStyle,
  containerStyle,
  includeTabInset = true,
  scrollProps,
}: AppScreenProps) {
  const theme = useTheme();

  const sharedContentStyle: StyleProp<ViewStyle> = [
    styles.content,
    {
      paddingBottom: includeTabInset
        ? BottomTabInset + Spacing.four
        : Spacing.four,
    },
    contentContainerStyle,
  ];

  if (!scroll) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: theme.background },
          containerStyle,
        ]}
      >
        <View style={sharedContentStyle}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
        containerStyle,
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={sharedContentStyle}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
});
