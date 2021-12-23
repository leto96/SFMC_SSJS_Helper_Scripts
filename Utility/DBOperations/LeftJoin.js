// Need to be ajusted
// Join Array of Objects in some field
  function leftJoinData(leftObjects, rightObjects, joinFieldName){
    // in this function, rightObjects must have unique values for it field joinFieldName

    var rightObjectmap = {};
    for(var i = 0; i < rightObjects.length; i++){
      // Makes the field value be the key, e.g.:
      // { id: 1, name: 'example1' } -> { 1 : { id: 1, name: 'example1' } }
      // { id: 2, name: 'example2' } -> { 2 : { id: 1, name: 'example1' } }
      rightObjectmap[ rightObjects[i][joinFieldName] ] = rightObjects[i];
    }

    // now do the "join":
    for(var i = 0; i < leftObjects.length; i++){
      var currentLeftObject = leftObjects[i];
      if( rightObjectmap[ currentLeftObject[joinFieldName] ] == undefined ){
        currentLeftObject[joinFieldName] = {};
      }else{
        currentLeftObject[joinFieldName] = rightObjectmap[ currentLeftObject[joinFieldName] ];
      }
    }

    return leftObjects;
  }

  module.exports = leftJoinData;