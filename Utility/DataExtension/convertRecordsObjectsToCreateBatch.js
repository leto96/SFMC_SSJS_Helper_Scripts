function convertArrayOfObjectsToBatch(ArrayOfRecordsObjects, DECustomerKey){
  // convert [{ 'key1': 'value1', 'key2': 'value2'}, { 'key3': 'value3', 'key4': 'value4'}] 
  // into [ {CustomerKey: DECustomerKey, Properties: [{ 'Name': 'key1', 'Value': 'value1'}, { 'Name': 'key2', 'Value': 'value2'}] } }, 
  //  {CustomerKey: DECustomerKey, Properties: [{ 'Name': 'key3', 'Value': 'value3'}, { 'Name': 'key4', 'Value': 'value4'}] } } ]

  var itemsToBatch = [];
  var recordToBatch = [];

  for(var i = 0; i < ArrayOfRecordsObjects.length; i++){
    recordToBatch = mapObjectRecordToArray(ArrayOfRecordsObjects[i]);

    itemsToBatch.push({
      CustomerKey: DECustomerKey,
      Properties: recordToBatch
    });
  }
  return itemsToBatch;
}

function mapObjectRecordToArray(objRecord){
  // convert { 'key': 'value'} into [{'Name': 'key', 'Value': 'value'}]
  var arrayRecord = [];
  var auxProp = {};

  for(prop in objRecord){
    auxProp.Name = prop;
    if( objRecord[prop] != null && objRecord[prop] != '' ){
      auxProp.Value = objRecord[prop];
    }else{
      auxProp["__Type__"] = 'NullAPIProperty';
    }
    arrayRecord.push(auxProp);
    auxProp = {};
  }

  return arrayRecord;
}