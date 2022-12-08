/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const result = [];
  if (arr) {
    arr.forEach(element => {
      if (!result.includes(element)) result.push(element);
    });
  }
  return result;
}
