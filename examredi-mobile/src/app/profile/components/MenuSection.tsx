import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuItemProps[];
}

export function MenuSection({ title, items }: MenuSectionProps) {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <AppText variant="label" color="textSecondary" style={styles.title}>
        {title}
      </AppText>
      <View style={[styles.list, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {items.map((item, index) => (
          <Pressable 
            key={item.label} 
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.item,
              pressed && { backgroundColor: theme.backgroundSelected },
              index !== items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
            ]}
          >
            <View style={styles.itemLeft}>
              <AppText style={styles.icon}>{item.icon}</AppText>
              <AppText variant="body">{item.label}</AppText>
            </View>
            {item.value ? (
              <AppText variant="caption" color="textSecondary">{item.value}</AppText>
            ) : (
              <AppText variant="body" color="textSecondary">›</AppText>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.six,
  },
  title: {
    marginBottom: Spacing.two,
  },
  list: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  icon: {
    fontSize: 18,
  },
});
