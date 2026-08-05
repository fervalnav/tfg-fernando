import { describe, expect, it } from 'vitest';
import { requiredEmail, requiredString, validateAvatarFile, validatePdfFile } from './formValidation';

describe('form validation helpers', () => {
  it('uses localized required messages and trims submitted text', () => {
    const schema = requiredString('El nombre es obligatorio');

    expect(schema.safeParse(undefined).error?.issues[0]?.message).toBe('El nombre es obligatorio');
    expect(schema.safeParse('   ').error?.issues[0]?.message).toBe('El nombre es obligatorio');
    expect(schema.parse('  Licitación  ')).toBe('Licitación');
  });

  it('distinguishes a missing email from an invalid email', () => {
    const schema = requiredEmail();

    expect(schema.safeParse(undefined).error?.issues[0]?.message).toBe('El email es obligatorio');
    expect(schema.safeParse('correo-invalido').error?.issues[0]?.message).toBe('Email inválido');
  });

  it('validates PDF type and the advertised 30 MB limit', () => {
    expect(validatePdfFile(new File(['pdf'], 'pliego.pdf', { type: 'application/pdf' }))).toBeNull();
    expect(validatePdfFile(new File(['texto'], 'pliego.txt', { type: 'text/plain' }))).toBe(
      'El archivo debe ser un PDF',
    );
    expect(validatePdfFile(new File([new Uint8Array(30 * 1024 * 1024 + 1)], 'grande.pdf'))).toBe(
      'El PDF no puede superar los 30 MB',
    );
  });

  it('validates avatar type and the advertised 5 MB limit', () => {
    expect(validateAvatarFile(new File(['image'], 'avatar.webp', { type: 'image/webp' }))).toBeNull();
    expect(validateAvatarFile(new File(['image'], 'avatar.gif', { type: 'image/gif' }))).toBe(
      'La imagen debe ser JPG, PNG o WebP',
    );
    expect(
      validateAvatarFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'avatar.png', { type: 'image/png' })),
    ).toBe('La imagen no puede superar los 5 MB');
  });
});
