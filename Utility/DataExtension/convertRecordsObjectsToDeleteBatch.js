function convertArrayOfObjectsToDeleteBatch(ArrayOfRecordsObjects, DECustomerKey, keyFields){
  // convert [{ 'key1': 'value1', 'key2': 'value2'}, { 'key3': 'value3', 'key4': 'value4'}] 
  // into [ {CustomerKey: DECustomerKey, Properties: [{ 'Name': 'key1', 'Value': 'value1'}, { 'Name': 'key2', 'Value': 'value2'}] } }, 
  //  {CustomerKey: DECustomerKey, Properties: [{ 'Name': 'key3', 'Value': 'value3'}, { 'Name': 'key4', 'Value': 'value4'}] } } ]

  var itemsToBatch = [];
  var recordToBatch = [];

  for(var i = 0; i < ArrayOfRecordsObjects.length; i++){
    recordToBatch = mapObjectRecordToArrayKeys(ArrayOfRecordsObjects[i], keyFields);

    itemsToBatch.push({
      CustomerKey: DECustomerKey,
      Keys: recordToBatch
    });
  }
  return itemsToBatch;
}

function mapObjectRecordToArrayKeys(objRecord, keyFields){
  // convert { 'key': 'value'} into [{'Name': 'key', 'Value': 'value'}]
  var arrayRecord = [];
  var auxProp = {};
  var keyField = '';

  for(var i = 0; i < keyFields.length; i++){
    keyField = keyFields[i];
    auxProp.Name = keyField;
    auxProp.Value = objRecord[keyField];
    
    arrayRecord.push(auxProp);
    auxProp = {};
  }

  return arrayRecord;
}