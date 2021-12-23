// <script runat="server">
Platform.Load("Core", "1.1.5");
var api = new Script.Util.WSProxy();

var customerKeySourceToRemove = 'QueryStudioResults at 2021-10-28T0047320000';
var customerKeyToDelete = 'E9FD1328-56C0-426C-8316-7FBEB5465B34';

var depara = [
  {
    source: 'CPF_CNPJ',
    destiny: 'CPF'
  }
];

try{

  var deSourceToExclude = DataExtensionRecordsOperator({api: api, dataExtensionCustomerKey: customerKeySourceToRemove});
  var sourceDataToExclude = deSourceToExclude.getRecords({ headers: [ depara[0].source ]});

  // Write('\nsourceDataToExclude\n');
  // Write(Stringify(sourceDataToExclude) + '\n');

  var formatedField = matchFields(sourceDataToExclude, depara);

  // Write('\nformatedField\n');
  // Write(Stringify(formatedField) + '\n');

  var deleteBatch = convertArrayOfObjectsToDeleteBatch(formatedField, customerKeyToDelete, [ depara[0].destiny ]);
  
  // Write('\ndeleteBatch\n');
  // Write(Stringify(deleteBatch) + '\n');

  var resultDeleteBatch = api.deleteBatch("DataExtensionObject", deleteBatch);

  Write('\nresultDeleteBatch\n');
  Write(Stringify(resultDeleteBatch.Results.length) + '\n');

}catch(e){
  Write('Error');
  Write(Stringify(e));
}

function DataExtensionRecordsOperator(configuration){
  var api;
  var customerKey;
  
  if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
  if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  if(!configuration.dataExtensionCustomerKey) Platform.Function.RaiseError('dataExtensionCustomerKey attribute is required');
  if(typeof configuration.dataExtensionCustomerKey != 'string') Platform.Function.RaiseError('dataExtensionCustomerKey must be a String');
  
  api = configuration.api;
  customerKey = configuration.dataExtensionCustomerKey;

  function getRecords(options){
    // options Object can have filter or headers
    if(!!options && typeof options != 'object') Platform.Function.RaiseError('Options must be an object or omitted');
        
    var headers;
    var filter;

    if(!!options && options.headers){
      headers = options.headers;
    }else{
      headers = retrieveFieldNames(customerKey, api);
    }

    if(!!options && options.filter) filter = options.filter;

    var config = {
      customerKey: customerKey,
      cols: headers
    }
  
    var records = [],
    moreData = true,
    reqID = data = null;

    while (moreData) {
      moreData = false;
      if (reqID == null) {
        if(filter == undefined || filter == null){
          data = api.retrieve("DataExtensionObject[" + config.customerKey + "]", config.cols);
        }else{
          data = api.retrieve("DataExtensionObject[" + config.customerKey + "]", config.cols, filter);
        }
        if(data.Status.substring(0, 5) == 'Error'){
          Platform.Function.RaiseError('Something went wrong: ' + data.Status);
        }
      } else {
        data = api.getNextBatch("DataExtensionObject[" + config.customerKey + "]", reqID);
      }

      if (data != null) {
        moreData = data.HasMoreRows;
        reqID = data.RequestID;
        for (var i = 0; i < data.Results.length; i++) {
          var result_list = data.Results[i].Properties;
          var obj = {};
          for (k in result_list) {
            var key = result_list[k].Name;
            var val = result_list[k].Value
            if (key.indexOf("_") != 0) obj[key] = val;
          }
        records.push(obj);
        }
      }
    }
    return records;
    
  }

  function retrieveFieldNames(customerKey, api) {
    var filter = {
      Property: "DataExtension.CustomerKey",
      SimpleOperator: "equals",
      Value: customerKey
    };

    var req = api.retrieve("DataExtensionField", ["Name"], filter);
    var fields = req.Results;
    var out = [];
    for (k in fields) {
      out = out.concat(fields[k].Name);
    }
    return out;
  }

  return {
    getRecords: getRecords
  }
}

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

  // Match fields from Base Qualificacao to Qualificacao - Cadastro Positivo
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
// </script>