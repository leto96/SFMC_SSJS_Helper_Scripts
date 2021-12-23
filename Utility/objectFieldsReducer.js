/* Reduce fields in array of objects returned in an API call  */

function objectsReducer(arrayOfObjects, fields) {
  if(!isArray(arrayOfObjects)) Platform.Function.RaiseError('First param must be an array of objects');
  if(!isArray(fields)) Platform.Function.RaiseError('Second param must be an array of strings (fields)');
  if(fields.length < 1) Platform.Function.RaiseError('Second param must have at least one element');
  if(arrayOfObjects.length == 0) return [];

  var reducedObject = [];
  var auxObjectFields = {}; 
  var auxFieldSeparator = [];
  for(var i = 0; i < arrayOfObjects.length; i++){
    if(!isLiteralObject(arrayOfObjects[i])) Platform.Function.RaiseError('Every element of the array must be an object');

    for(var j = 0; j < fields.length; j++){
      auxFieldSeparator = fields[j].split('.');
      if(auxFieldSeparator.length > 1){
        var tmpInnerValue = {};
        tmpInnerValue[ auxFieldSeparator[1] ] = arrayOfObjects[i][ auxFieldSeparator[0] ][ auxFieldSeparator[1] ];
        auxObjectFields[ auxFieldSeparator[0] ] = tmpInnerValue;
      }else{
        auxObjectFields[ fields[j] ] = arrayOfObjects[i][ fields[j] ];
      }
    }

    reducedObject.push(auxObjectFields);
    auxObjectFields = {};
    auxFieldSeparator = [];
  }

  return reducedObject;
  
  function isLiteralObject(obj){
    return !!obj && (typeof obj == 'object' || typeof obj == 'function') && (obj != null) && !isArray(obj)
  };
  
  function isArray(a){
    return (!!a) && Object.prototype.toString.call(a) == '[object Array]' 
  };
  
}