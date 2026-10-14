import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Obligatorio, ignorando espacios al inicio y al final. */
export const requeridoTrim: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  String(c.value ?? '').trim() ? null : { requerido: true };

/** Longitud mínima, ignorando espacios al inicio y al final. */
export const minTrim = (min: number): ValidatorFn => (c: AbstractControl): ValidationErrors | null =>
  String(c.value ?? '').trim().length >= min ? null : { minTrim: { min } };

/** Mismo patrón de correo que usaba vistaContacto(). */
export const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const correoValido: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  PATRON_CORREO.test(String(c.value ?? '').trim()) ? null : { correo: true };
