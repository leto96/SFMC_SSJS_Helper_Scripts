var isArray = require('./isArray');

function isLiteralObject(obj) {
  return !!obj && (typeof obj == "object" || typeof obj == 'function') && (obj != null) && !isArray(obj)
};

/* function isArray(a) {
  return (!!a) && Object.prototype.toString.call(a) == '[object Array]'
}; */

module.exports = isLiteralObject;