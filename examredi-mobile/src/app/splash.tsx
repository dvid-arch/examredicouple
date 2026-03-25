import React from 'react';
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

import { Colors } from '@/constants/theme';

const BRAND_PRIMARY = Colors.light.primary;
const BRAND_DARK = Colors.light.primaryDark;
const BRAND_DEEPER = Colors.light.background; 

const MIN_DISPLAY_MS = 1800;

export default function SplashScreen() {
  const router = useRouter();
  const { isBootstrapping, isAuthenticated } = useAuth();
  const mountTimeRef = React.useRef(Date.now());

  // Entry animations
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const logoScale = React.useRef(new Animated.Value(0.72)).current;
  const taglineOpacity = React.useRef(new Animated.Value(0)).current;
  const taglineY = React.useRef(new Animated.Value(14)).current;
  const screenOpacity = React.useRef(new Animated.Value(1)).current;
  const ringScale = React.useRef(new Animated.Value(0.6)).current;
  const ringOpacity = React.useRef(new Animated.Value(0)).current;

  // Loading dots
  const d1 = React.useRef(new Animated.Value(0.15)).current;
  const d2 = React.useRef(new Animated.Value(0.15)).current;
  const d3 = React.useRef(new Animated.Value(0.15)).current;

  React.useEffect(() => {
    // Logo springs in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(ringOpacity, {
        toValue: 1,
        duration: 700,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(ringScale, {
        toValue: 1,
        duration: 900,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Staggered loading-dot loop
    const animateDot = (dot: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 380,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.15,
              duration: 380,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }, delay);
    };

    animateDot(d1, 500);
    animateDot(d2, 720);
    animateDot(d3, 940);
  }, []);

  React.useEffect(() => {
    if (!isBootstrapping) {
      const elapsed = Date.now() - mountTimeRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

      const timer = setTimeout(() => {
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          if (isAuthenticated) {
            router.replace('/dashboard');
          } else {
            router.replace('/auth');
          }
        });
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isBootstrapping, isAuthenticated, router, screenOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_DEEPER} />

      {/* Decorative background circles */}
      <View style={[styles.bgCircle, styles.bgCircleTopRight]} />
      <View style={[styles.bgCircle, styles.bgCircleBottomLeft]} />
      <View style={[styles.bgCircle, styles.bgCircleMid]} />

      {/* Pulsing glow ring behind logo */}
      <Animated.View
        style={[
          styles.glowRing,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />

      {/* Logo block */}
      <Animated.View
        style={[
          styles.logoBlock,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkLetter}>E</Text>
        </View>
        <Text style={styles.wordmark}>ExamRedi</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineBlock,
          { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
        ]}
      >
        <Text style={styles.tagline}>Your UTME success companion</Text>
        <Text style={styles.subTagline}>Study smarter. Score higher.</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        {[d1, d2, d3].map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_DEEPER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  bgCircleTopRight: {
    width: 420,
    height: 420,
    top: -110,
    right: -130,
    backgroundColor: BRAND_PRIMARY,
    opacity: 0.2,
  },
  bgCircleBottomLeft: {
    width: 340,
    height: 340,
    bottom: -90,
    left: -100,
    backgroundColor: BRAND_PRIMARY,
    opacity: 0.14,
  },
  bgCircleMid: {
    width: 160,
    height: 160,
    top: '25%',
    left: '62%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoBlock: {
    alignItems: 'center',
    gap: 14,
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 12,
  },
  logoMarkLetter: {
    fontSize: 44,
    fontWeight: '900',
    color: BRAND_PRIMARY,
    lineHeight: 50,
  },
  wordmark: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  taglineBlock: {
    alignItems: 'center',
    gap: 5,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  subTagline: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 9,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
