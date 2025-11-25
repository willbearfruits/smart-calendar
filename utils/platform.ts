import { Capacitor } from '@capacitor/core';

/**
 * Platform detection utilities for cross-platform functionality
 */

export const Platform = {
  /**
   * Check if running on a native platform (iOS or Android)
   */
  isNative: (): boolean => {
    return Capacitor.isNativePlatform();
  },

  /**
   * Check if running on iOS
   */
  isIOS: (): boolean => {
    return Capacitor.getPlatform() === 'ios';
  },

  /**
   * Check if running on Android
   */
  isAndroid: (): boolean => {
    return Capacitor.getPlatform() === 'android';
  },

  /**
   * Check if running in web browser
   */
  isWeb: (): boolean => {
    return Capacitor.getPlatform() === 'web';
  },

  /**
   * Get current platform name
   */
  getPlatform: (): string => {
    return Capacitor.getPlatform();
  },

  /**
   * Check if plugin is available
   */
  isPluginAvailable: (pluginName: string): boolean => {
    return Capacitor.isPluginAvailable(pluginName);
  },

  /**
   * Check if running on mobile device (native iOS or Android)
   */
  isMobile: (): boolean => {
    return Platform.isIOS() || Platform.isAndroid();
  },

  /**
   * Check if device has notch/safe area (primarily iOS)
   */
  hasSafeArea: (): boolean => {
    return Platform.isIOS();
  }
};

/**
 * Get safe area insets for iOS devices with notch
 */
export const getSafeAreaInsets = () => {
  if (!Platform.isIOS()) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Get CSS safe-area-inset values
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10)
  };
};

/**
 * Apply safe area CSS variables
 */
export const applySafeAreaVars = () => {
  if (Platform.isIOS()) {
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
  }
};
