function mapObjectRecordToArray(objRecord){
  // convert { 'key': 'value'} into [{'Name': 'key', 'Value': 'value'}]
  var arrayRecord = [];

  for(prop in objRecord){
    arrayRecord.push({
      Name: prop,
      Value: objRecord[prop]
    });
  }

  return arrayRecord;
}