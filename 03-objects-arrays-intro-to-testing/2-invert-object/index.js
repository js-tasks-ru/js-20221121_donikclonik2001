/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj) return;
  const newObj = {};
  for (const key in obj) {
    newObj[obj[key]] = key;
  }
  return newObj;
}
