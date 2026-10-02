import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { SplashColors } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const PATTERN_ICONS: IconName[] = [
  'chef-hat',
  'silverware-fork-knife',
  'pot-steam-outline',
  'leaf',
  'food-apple-outline',
  'knife',
];

const TILE = 76;
const ICON_SIZE = 26;
const PATTERN_OPACITY = 0.07;

const ICON_DELAY = 500;
const ICON_DURATION = 700;
const TITLE_DELAY = ICON_DELAY + 500;
const TITLE_DURATION = 700;
const SLOGAN_DELAY = TITLE_DELAY + 450;
const SLOGAN_STAGGER = 220;
const SLOGAN_DURATION = 600;

/** Кастомный JS-сплэш: терракотовый фон с едва заметным кулинарным узором,
 *  затем последовательное появление иконки, названия и слогана.
 *  Только Animated с useNativeDriver — главный поток не нагружаем. */
export function AppSplash() {
  const { width, height } = useWindowDimensions();

  const iconAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const sloganAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const fade = (value: Animated.Value, delay: number, duration: number) =>
      Animated.timing(value, {
        toValue: 1,
        delay,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

    const animation = Animated.parallel([
      fade(iconAnim, ICON_DELAY, ICON_DURATION),
      fade(titleAnim, TITLE_DELAY, TITLE_DURATION),
      ...sloganAnims.map((value, index) => fade(value, SLOGAN_DELAY + index * SLOGAN_STAGGER, SLOGAN_DURATION)),
    ]);
    animation.start();
    return () => animation.stop();
  }, [iconAnim, titleAnim, sloganAnims]);

  const tiles = useMemo(() => {
    const columns = Math.ceil(width / TILE) + 1;
    const rows = Math.ceil(height / TILE) + 1;
    return Array.from({ length: columns * rows }, (_, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      return {
        key: index,
        icon: PATTERN_ICONS[(row * 2 + col) % PATTERN_ICONS.length],
        rotate: `${((row + col) % 2 === 0 ? -1 : 1) * (8 + ((row * 3 + col * 5) % 14))}deg`,
        offsetX: row % 2 === 0 ? 0 : TILE / 2,
      };
    });
  }, [width, height]);

  return (
    <View style={styles.root}>
      <View style={styles.pattern} pointerEvents="none">
        {tiles.map((tile) => (
          <View key={tile.key} style={[styles.tile, { transform: [{ translateX: tile.offsetX }] }]}>
            <MaterialCommunityIcons
              name={tile.icon}
              size={ICON_SIZE}
              color="#FFFFFF"
              style={{ transform: [{ rotate: tile.rotate }] }}
            />
          </View>
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: iconAnim,
            transform: [{ translateY: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [-36, 0] }) }],
          }}>
          <MaterialCommunityIcons name="chef-hat" size={96} color={SplashColors.title} />
        </Animated.View>

        <Animated.View
          style={{
            width: '100%',
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
          }}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            ШЕФ В КАРМАНЕ
          </Text>
        </Animated.View>

        <View style={styles.slogan}>
          <Animated.Text style={[styles.line1, { opacity: sloganAnims[0] }]}>Ваш персональный шеф-повар</Animated.Text>
          <Animated.Text style={[styles.line2, { opacity: sloganAnims[1] }]}>и умная корзина</Animated.Text>
          <Animated.Text style={[styles.line3, { opacity: sloganAnims[2] }]}>в одном клике.</Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SplashColors.background,
    overflow: 'hidden',
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: PATTERN_OPACITY,
  },
  tile: {
    width: TILE,
    height: TILE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: SplashColors.title,
    textAlign: 'center',
  },
  slogan: {
    marginTop: 28,
    alignItems: 'center',
  },
  line1: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: SplashColors.title,
    textAlign: 'center',
  },
  line2: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: SplashColors.tagline,
    textAlign: 'center',
  },
  line3: {
    marginTop: 4,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: SplashColors.title,
    textAlign: 'center',
  },
});
