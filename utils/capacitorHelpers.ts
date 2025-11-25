import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from './platform';

/**
 * Capacitor helper functions for native features
 */

export interface CameraOptions {
  source?: 'camera' | 'photos' | 'prompt';
  quality?: number;
}

/**
 * Take a photo or select from gallery using Capacitor Camera API
 * Falls back to web file input if not on native platform
 */
export const takePicture = async (options: CameraOptions = {}): Promise<string | null> => {
  // If not on native platform, return null to use web fallback
  if (!Platform.isNative() || !Platform.isPluginAvailable('Camera')) {
    return null;
  }

  try {
    const sourceMap = {
      camera: CameraSource.Camera,
      photos: CameraSource.Photos,
      prompt: CameraSource.Prompt
    };

    const image = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: sourceMap[options.source || 'prompt']
    });

    // Return base64 string with data URI prefix
    return `data:image/${image.format};base64,${image.base64String}`;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
};

/**
 * Check camera permissions
 */
export const checkCameraPermissions = async (): Promise<boolean> => {
  if (!Platform.isNative() || !Platform.isPluginAvailable('Camera')) {
    return true; // Web doesn't need explicit permissions
  }

  try {
    const permissions = await Camera.checkPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Error checking camera permissions:', error);
    return false;
  }
};

/**
 * Request camera permissions
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  if (!Platform.isNative() || !Platform.isPluginAvailable('Camera')) {
    return true;
  }

  try {
    const permissions = await Camera.requestPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return false;
  }
};

/**
 * Save text file using Capacitor Filesystem API
 */
export const saveTextFile = async (
  fileName: string,
  data: string,
  directory: Directory = Directory.Documents
): Promise<boolean> => {
  if (!Platform.isNative() || !Platform.isPluginAvailable('Filesystem')) {
    return false; // Web uses download link
  }

  try {
    await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: directory,
      encoding: Encoding.UTF8
    });
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
};

/**
 * Read text file using Capacitor Filesystem API
 */
export const readTextFile = async (
  fileName: string,
  directory: Directory = Directory.Documents
): Promise<string | null> => {
  if (!Platform.isNative() || !Platform.isPluginAvailable('Filesystem')) {
    return null;
  }

  try {
    const result = await Filesystem.readFile({
      path: fileName,
      directory: directory,
      encoding: Encoding.UTF8
    });
    return result.data as string;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

/**
 * Delete file using Capacitor Filesystem API
 */
export const deleteFile = async (
  fileName: string,
  directory: Directory = Directory.Documents
): Promise<boolean> => {
  if (!Platform.isNative() || !Platform.isPluginAvailable('Filesystem')) {
    return false;
  }

  try {
    await Filesystem.deleteFile({
      path: fileName,
      directory: directory
    });
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Get URI for a file using Capacitor Filesystem API
 */
export const getFileUri = async (
  fileName: string,
  directory: Directory = Directory.Documents
): Promise<string | null> => {
  if (!Platform.isNative() || !Platform.isPluginAvailable('Filesystem')) {
    return null;
  }

  try {
    const result = await Filesystem.getUri({
      path: fileName,
      directory: directory
    });
    return result.uri;
  } catch (error) {
    console.error('Error getting file URI:', error);
    return null;
  }
};
