/**
 * Transform a class list into a class string, helper for boolean classes
 *
 * @param xs - The class list
 */
export function clazz(...xs: (string | boolean | undefined | null)[]) {
  return xs.filter(x => typeof x === "string").join(" ");
}
