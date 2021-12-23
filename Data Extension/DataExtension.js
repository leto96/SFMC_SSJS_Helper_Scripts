function DataExtensionCollection(configuration) {
  if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
  if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  var api = configuration.api;

  // if(!customerKey && !name) Platform.Function.RaiseError('Either \"customerKey\" or \"name\" is required');

  function generateDataExtensionObject(obj){
    if(!obj) return;
    var formatedObject = {
      ObjectID: obj.ObjectID,
      PartnerKey: obj.PartnerKey,
      CustomerKey: obj.CustomerKey,
      Name: obj.Name,
      CreatedDate: obj.CreatedDate,
      ModifiedDate: obj.ModifiedDate,
      Description: obj.Description,
      IsSendable: obj.IsSendable,
      IsTestable: obj.IsTestable,
      CategoryID: obj.CategoryID,
      Status: obj.Status,
      IsPlatformObject: obj.IsPlatformObject,
      DataRetentionPeriodLength: obj.DataRetentionPeriodLength,
      DataRetentionPeriodUnitOfMeasure: obj.DataRetentionPeriodUnitOfMeasure,
      RowBasedRetention: obj.RowBasedRetention,
      ResetRetentionPeriodOnImport: obj.ResetRetentionPeriodOnImport,
      DeleteAtEndOfRetentionPeriod: obj.DeleteAtEndOfRetentionPeriod,
      RetainUntil: obj.RetainUntil,
      DataRetentionPeriod: obj.DataRetentionPeriod
    }
    if(obj.Template && obj.Template.CustomerKey){
      formatedObject.Template = {CustomerKey: obj.Template.CustomerKey};
    }else{
      formatedObject.Template = {CustomerKey: null};
    }
    if(obj.SendableSubscriberField && obj.SendableSubscriberField.Name){
      formatedObject.SendableSubscriberField = {Name: obj.SendableSubscriberField.Name};
    }else{
      formatedObject.SendableSubscriberField = {Name: null};
    }
    if(obj.SendableDataExtensionField && obj.SendableDataExtensionField.Name){
      formatedObject.SendableDataExtensionField = {Name: obj.SendableDataExtensionField.Name};
    }else{
      formatedObject.SendableDataExtensionField = {Name: null};
    }
    if(obj.Client && obj.Client.ID){
      formatedObject.Client = {ID: obj.Client.ID};
    }else{
      formatedObject.Client = {ID: null};
    }

    return formatedObject;
  }

  function retriveDEs(prop, operator, value){
    var retrieveFilter = {
      Property: prop,
      SimpleOperator: operator,
      Value: value
    };

    var retrievedDE = api.retrieve('DataExtension', [
      'ObjectID',
      'PartnerKey',
      'CustomerKey',
      'Name',
      'CreatedDate',
      'ModifiedDate',
      'Description',
      'IsSendable',
      'IsTestable',
      'CategoryID',
      'Status',
      'IsPlatformObject',
      'DataRetentionPeriodLength',
      'DataRetentionPeriodUnitOfMeasure',
      'RowBasedRetention',
      'ResetRetentionPeriodOnImport',
      'DeleteAtEndOfRetentionPeriod',
      'RetainUntil',
      'DataRetentionPeriod',
      'Template.CustomerKey',
      'SendableSubscriberField.Name',
      'SendableDataExtensionField.Name',
      'Client.ID'
      ], retrieveFilter
    );
    return retrievedDE.Results;
  }

  function getDEsInisdeFolder(folderID){
    var des = retriveDEs('CategoryID', 'equals', folderID);

    return mapArray(des, function(de){
      return generateDataExtensionObject(de);
    });
  }

  function getDEWithNameLike(name){
    var des = retriveDEs('Name', 'like', name);
    
    return mapArray(des, function(de){
      return generateDataExtensionObject(de);
    });
  }

  function getAllDEs(){
    var des = api.retrieve('DataExtension', [
      'ObjectID',
      'PartnerKey',
      'CustomerKey',
      'Name',
      'CreatedDate',
      'ModifiedDate',
      'Description',
      'IsSendable',
      'IsTestable',
      'CategoryID',
      'Status',
      'IsPlatformObject',
      'DataRetentionPeriodLength',
      'DataRetentionPeriodUnitOfMeasure',
      'RowBasedRetention',
      'ResetRetentionPeriodOnImport',
      'DeleteAtEndOfRetentionPeriod',
      'RetainUntil',
      'DataRetentionPeriod',
      'Template.CustomerKey',
      'SendableSubscriberField.Name',
      'SendableDataExtensionField.Name',
      'Client.ID'
      ]
    ).Results;
    
    return mapArray(des, function(de){
      return generateDataExtensionObject(de);
    });
  }

  function mapArray(array, callback, thisArg) {
    var T, A, k;var O = array;var len = O.length;if (typeof callback !== 'function') {throw new TypeError(callback + ' is not a function');}if (arguments.length > 2) {T = thisArg;}A = [];k = 0;while (k < len) {var kValue, mappedValue;kValue = O[k];mappedValue = callback.call(T, O[k], k, O);A.push(mappedValue);k++;}return A;
  }
  
  return {
    getDEWithNameLike: getDEWithNameLike,
    getDEsInisdeFolder: getDEsInisdeFolder,
    getAllDEs: getAllDEs
  }
}