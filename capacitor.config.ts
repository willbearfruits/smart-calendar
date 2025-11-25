import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartcalendar.app',
  appName: 'Smart Calendar',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#6366f1'
    },
    Camera: {
      permissions: {
        ios: {
          NSCameraUsageDescription: 'Smart Calendar needs access to your camera to scan handwritten notes.',
          NSPhotoLibraryUsageDescription: 'Smart Calendar needs access to your photo library to select images of handwritten notes.'
        }
      }
    },
    Filesystem: {
      permissions: {
        android: {
          WRITE_EXTERNAL_STORAGE: 'Smart Calendar needs storage access to save calendar exports.',
          READ_EXTERNAL_STORAGE: 'Smart Calendar needs storage access to read images.'
        }
      }
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f172a'
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0f172a'
  }
};

export default config;
