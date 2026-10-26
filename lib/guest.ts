// Anonymous visitors get a random guest ID in an httpOnly cookie; it scopes their data.
export const GUEST_COOKIE = "careeros_guest";

export const GUEST_MAX_AGE = 60 * 60 * 24 * 400;

const guestPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function isGuestId(value: unknown): value is string {
  return typeof value === "string" && guestPattern.test(value);
}
