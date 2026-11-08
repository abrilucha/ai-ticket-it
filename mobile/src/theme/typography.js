/**
 * Pop Kinetic Typography Scale
 * Usa las familias exactas de las fuentes cargadas mediante Expo Google Fonts.
 */

export const FontFamily = {
  headlineExtraBold: 'BricolageGrotesque_800ExtraBold',
  headlineBold: 'BricolageGrotesque_700Bold',
  headlineSemiBold: 'BricolageGrotesque_600SemiBold',
  bodyRegular: 'SpaceGrotesk_400Regular',
  bodyMedium: 'SpaceGrotesk_500Medium',
  bodySemiBold: 'SpaceGrotesk_600SemiBold',
  bodyBold: 'SpaceGrotesk_700Bold',
};

export const Typography = {
  headlineXl: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  headlineMd: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  titleLg: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 18,
    lineHeight: 24,
  },
  titleMd: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMd: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  labelLg: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelMd: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  labelSm: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};
