// <script runat="server">

Platform.Load("Core", "1.1.5");
var api = new Script.Util.WSProxy();

var sourceDENameWithRowToDelete = 'Remover Contatos Quarentena'; 
var tagetDENameToDeleteRows = 'Tb_Base_Quarentena';
var logDEName = 'resultados delete_2';
var logDECK = retrieveDECustomerKeyFromName(api, logDEName)

var depara = [
  {
    source: 'CPF_CNPJ',
    destiny: 'CPF_CNPJ'
  }
];

try{

var deSourceToExclude = DataExtensionRecordsOperator({api: api, dataExtensionName: sourceDENameWithRowToDelete});

function myDeleteFunction(records){
  // Write('records' + '\n');
  // Write(Stringify(records) + '\n\n');

  // Write('depara' + '\n');
  // Write(Stringify(depara) + '\n\n');
  var formatedField = matchFields(records, depara);
  
  var deleteBatch = convertArrayOfObjectsToDeleteBatch(formatedField, retrieveDECustomerKeyFromName(api, tagetDENameToDeleteRows), [ depara[0].destiny ]);
  
  var resultDeleteBatch = api.deleteBatch("DataExtensionObject", deleteBatch);
  
  
  insertRecordInDE(api, {RESULTADO: 'Apagados: ' + resultDeleteBatch.Results.length}, logDECK);


  Write('\nresultDeleteBatch\n');
  Write(Stringify(resultDeleteBatch.Results.length) + '\n');

}
var sourceDataToExclude = deSourceToExclude.pipeExecuteInAllRecords(null, myDeleteFunction, 2000);

Write('concluido' + '\n');

}catch(e){
  Write('Error');
  Write(Stringify(e));
}

function DataExtensionRecordsOperator(configuration){
  var api;
  var customerKey;
  
  if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
  if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  if(!configuration.dataExtensionCustomerKey && !configuration.dataExtensionName) Platform.Function.RaiseError('dataExtensionCustomerKey or dataExtensionName attribute is required');
  if(configuration.dataExtensionCustomerKey && typeof configuration.dataExtensionCustomerKey != 'string') Platform.Function.RaiseError('dataExtensionCustomerKey must be a String');
  api = configuration.api;
  
  if(configuration.dataExtensionCustomerKey == null || configuration.dataExtensionCustomerKey == ''){
    var simpleFilter = {
      Property: 'Name',
      SimpleOperator: 'equals',
      Value: configuration.dataExtensionName
    }
    customerKey = api.retrieve("DataExtension", ["CustomerKey"], simpleFilter).Results[0].CustomerKey;
  }else{
    customerKey = configuration.dataExtensionCustomerKey;
  }

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

  function pipeExecuteInAllRecords(options, cb, batchSize){
    // options Object can have filter or headers
    if(!!options && typeof options != 'object') Platform.Function.RaiseError('Options must be an object or omitted');
    var batchSizeActual = batchSize == null || batchSize == undefined ? 2500 : batchSize;
    batchSizeActual = batchSizeActual > 2500 ? 2500 : batchSizeActual;
    if(batchSizeActual == 0) Platform.Function.RaiseError('batchSize cannot be 0');
        
    var filter;
    headers = retrieveFieldNames(customerKey, api);

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
        var retrievedData = data.Results;
        while ( retrievedData.length != 0 ) {
          var currentData = retrievedData.splice(0, batchSizeActual);
          for (var i = 0; i < currentData.length; i++) {
            var result_list = currentData[i].Properties;
            var obj = {};
            for (k in result_list) {
              var key = result_list[k].Name;
              var val = result_list[k].Value
              if (key.indexOf("_") != 0) obj[key] = val;
            }
            records.push(obj);
          }
          cb(records); // operate over the first Chunck
          records = []; // clear records, free up memory
        }
      }
    }
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
    getRecords: getRecords,
    pipeExecuteInAllRecords: pipeExecuteInAllRecords
  }
}

function insertRecordInDE(api, record, customerKey){
  if(!api) Platform.Function.RaiseError('Api param is required');
  var props = [];
  for(prop in record){
    props.push( {Name: prop, Value: record[prop] } );
  }
  var data = {
    CustomerKey: customerKey,
    Properties: props
  }
  return api.createItem('DataExtensionObject', data);
}

function retrieveDECustomerKeyFromName(api, dataExtensionName){
  var simpleFilter = {
    Property: 'Name',
    SimpleOperator: 'equals',
    Value: dataExtensionName
  }
  var result = api.retrieve('DataExtension', ['CustomerKey'], simpleFilter);
  if(result.Status != 'OK' || result.Results.length < 1){
    return null
  }else{
    return result.Results[0].CustomerKey;
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
