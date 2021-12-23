function matchFields(arrayOfRecords, fieldsToMatch){
  // fieldsToMatch must be an array of objects like:
  /*
  [
    {
      source: 'de',
      destiny: 'para'
    },
    {
      source: 'de',
      destiny: 'para'
    }
  ] 
  */

  var arrayOfRecordsResult = [];
  var auxRecord = {};
  var auxCurrentRecord = {}
  for(var i = 0; i < arrayOfRecords.length; i++){
    auxCurrentRecord = arrayOfRecords[i];

    for(var key in auxCurrentRecord){
      var found = false;
      if(fieldsToMatch && fieldsToMatch.length > 0){
        for(var j = 0; !found && j < fieldsToMatch.length; j++){
          if(key === fieldsToMatch[j].source){
            auxRecord[ fieldsToMatch[j].destiny ] = auxCurrentRecord[fieldsToMatch[j].source];
            found = true;
          }
        }
      }
      
      if(!found){
        auxRecord[key] = auxCurrentRecord[key];
      }
    }
    
    arrayOfRecordsResult.push(auxRecord);
    auxRecord = {};
    auxCurrentRecord = {};
  }

  return arrayOfRecordsResult;
}

exports.matchFields = matchFields;