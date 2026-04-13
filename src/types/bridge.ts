/**
 * Shared Bridge Types — Web ↔ Native communication protocol.
 * Both Next.js (web) and React Native (mobile) must use these same types.
 */

// Web → Native messages
export type WebToNativeMessage =
  | { type: 'MAP_READY'; payload: { version: string } }
  | { type: 'MAP_ERROR'; payload: { code: string; message: string } }
  | { type: 'BUILDING_CLICK'; payload: { id: string; name: string; lat: number; lng: number } }
  | { type: 'CAMERA_MOVED'; payload: { lat: number; lng: number; height: number } };

// Native → Web messages
export type NativeToWebMessage =
  | { type: 'FLY_TO'; payload: { lat: number; lng: number; height?: number } }
  | { type: 'HIGHLIGHT_BUILDING'; payload: { id: string } }
  | { type: 'CLEAR_HIGHLIGHT'; payload: null }
  | { type: 'SET_FILTER'; payload: { key: string; value: string | number | boolean } }
  | { type: 'TOGGLE_3D'; payload: { enabled: boolean } }
  | { type: 'PAUSE_RENDER'; payload: null }
  | { type: 'RESUME_RENDER'; payload: null };

export type BridgeMessage = WebToNativeMessage | NativeToWebMessage;

// Window augmentation for ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(data: string): void;
    };
  }
}
