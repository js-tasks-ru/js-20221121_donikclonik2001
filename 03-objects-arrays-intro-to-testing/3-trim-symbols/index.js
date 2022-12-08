/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) return string;
  if (size === 0) return '';

  const charArr = string.split('');
  const result = [];
  for (let i = 0; i < charArr.length; i++) {
    if (charArr[i] === charArr[i + 1]) {
      let count = 1;
      let j = i;

      while (charArr[j] === charArr[j + 1]) {
        ++count;
        ++j;
      }

      if (count > size) {
        result.push(...charArr.slice(i, i + size));
      } else {
        result.push(...charArr.slice(i, i + count));
      }

      i = j;

    } else {
      result.push(charArr[i]);
    }
  }
  return result.join('');
}
