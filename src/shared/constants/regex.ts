export const ISO_DATETIME = /(Z|[+-]\d{2}:\d{2})$/;
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const TIME = /^(?:2[0-3]|[01]\d):[0-5]\d:[0-5]\d$/;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
