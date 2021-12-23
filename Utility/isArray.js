function isArray(a) {
  return (!!a) && Object.prototype.toString.call(a) == '[object Array]'
};

module.exports = isArray;