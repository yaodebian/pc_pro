/**
 * 简单防抖函数
 * @param {Function} func 
 * @param {Number} wait 
 */
function debounce (func, wait) {
  var timeout;
  return function () {
      clearTimeout(timeout)
      timeout = setTimeout(func, wait);
  }
}