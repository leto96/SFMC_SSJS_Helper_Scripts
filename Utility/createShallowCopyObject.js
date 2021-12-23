function createShallowCopyObject(object){
  var newObject = {};
  for(field in object){
    newObject[field] = object[field];
  }
  return newObject;
}

module.exports = createShallowCopyObject;