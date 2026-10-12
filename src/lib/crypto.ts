/**
 * Cryptographic Utilities for SafeGuard AI
 * Provides browser-native, tamper-evident SHA-256 integrity hashing
 */

export async function calculateFileSHA256(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function calculateTextSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function detectFileType(file: File): 'photo' | 'video' | 'screenshot' | 'audio' | 'document' | 'other' {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  // Heuristic for screenshots
  if (
    name.includes('screenshot') ||
    name.includes('screen_shot') ||
    name.includes('screencap') ||
    name.startsWith('scr_') ||
    name.includes('snip')
  ) {
    return 'screenshot';
  }

  if (mime.startsWith('image/')) {
    return 'photo';
  }

  if (mime.startsWith('video/')) {
    return 'video';
  }

  if (mime.startsWith('audio/')) {
    return 'audio';
  }

  if (
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('text') ||
    name.endsWith('.pdf') ||
    name.endsWith('.docx') ||
    name.endsWith('.txt') ||
    name.endsWith('.csv')
  ) {
    return 'document';
  }

  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
