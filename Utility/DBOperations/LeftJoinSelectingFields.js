var createShallowCopyObject = require('../createShallowCopyObject');
var isLiteralObject = require('../isLiteralObject');
var isArray = require('../isArray');

// Join Array of Objects in some field
function leftJoinData(leftArrayOfObjects, rightArrayOfObjects, leftObjectJoinField, rightObjectJoinField){
  
  if( !isArray(leftArrayOfObjects) ) throw new Error('First argument must be an array of objects (left object)');
    if(typeof leftObjectJoinField != 'string') throw new Error('Third argument must be an string');
    for(var leftObject in leftArrayOfObjects){
      if( !isLiteralObject( leftArrayOfObjects[leftObject] ) ) throw new Error('First argument must be an array of objects (left object)');
    }

    if( !isArray(rightArrayOfObjects) ) throw new Error('Second argument must be an array of objects (right object)');
    if(typeof rightObjectJoinField != 'string') throw new Error('Fourth argument must be an string');
    for(var rightObject in rightArrayOfObjects){
      if( !isLiteralObject( rightArrayOfObjects[rightObject] ) ) throw new Error('Second argument must be an array of objects (right object)');
    }

    var newLeftArrayOfObjects = [];
    var newLeftObject = {};
    var rightObject = {};
    for(var i = 0; i < leftArrayOfObjects.length; i++){
      newLeftObject = createShallowCopyObject(leftArrayOfObjects[i]);


      for (var j = 0; j < rightArrayOfObjects.length; j++) {
        rightObject = createShallowCopyObject(rightArrayOfObjects[j]);
        if( newLeftObject[leftObjectJoinField] != undefined && newLeftObject[leftObjectJoinField] != null 
          && newLeftObject[leftObjectJoinField] == rightObject[rightObjectJoinField] ){
          newLeftObject[leftObjectJoinField] = rightObject;
          j = rightArrayOfObjects.length; // Exit
        }
        rightObject = {};
      }
      
      newLeftArrayOfObjects.push(newLeftObject);
      newLeftObject = {};
    }

    return newLeftArrayOfObjects;

}

/* function isLiteralObject(obj) {
  return !!obj && (typeof obj == "object" || typeof obj == 'function') && (obj != null) && !isArray(obj)
};
 */

/* function isArray(a) {
  return (!!a) && Object.prototype.toString.call(a) == '[object Array]'
}; */

/* function createShallowCopyObject(object){
  var newObject = {};
  for(field in object){
    newObject[field] = object[field];
  }
  return newObject;
} */

module.exports = leftJoinData;