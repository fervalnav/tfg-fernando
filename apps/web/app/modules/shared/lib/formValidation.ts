import { z } from 'zod';

const MEBIBYTE = 1024 * 1024;

export function requiredString(message: string) {
  return z.string({ required_error: message }).trim().min(1, message);
}

export function requiredEmail(requiredMessage = 'El email es obligatorio', invalidMessage = 'Email inválido') {
  return requiredString(requiredMessage).email(invalidMessage);
}

export function validatePdfFile(file: File): string | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'El archivo debe ser un PDF';
  if (file.size > 30 * MEBIBYTE) return 'El PDF no puede superar los 30 MB';
  return null;
}

export function validateAvatarFile(file: File): string | null {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(file.type)) return 'La imagen debe ser JPG, PNG o WebP';
  if (file.size > 5 * MEBIBYTE) return 'La imagen no puede superar los 5 MB';
  return null;
}
