const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?\d{8,15}$/;
const POSTAL_CODE = /^\d{5}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const OBJECT_ID = /^[a-f\d]{24}$/i;

export const isObjectId = (value: string) => OBJECT_ID.test(value);

export const isEmail = (value: string) => EMAIL.test(value.trim());

export const isPhone = (value: string) =>
  PHONE.test(value.replace(/[\s()-]/g, ""));

export const isPostalCode = (value: string) => POSTAL_CODE.test(value.trim());

export const isTime = (value: string) => TIME.test(value);

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const hasErrors = <T>(errors: FieldErrors<T>) =>
  Object.values(errors).some(Boolean);
