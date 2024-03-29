function DataExtensionFolders(configuration){
  if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
  if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  
  var api = configuration.api;
  var headers = GlobalObject({api: api}).getAllRetrievableFields('DataFolder');

  function retrieveFoldersByName(name){
    // Filter to get the parent folder
    var folderFitler = {
      LeftOperand: {
        Property: "Name",
        SimpleOperator: 'equals',
        Value: name
      },
      LogicalOperator: "AND",
      RightOperand: {
        Property: "ContentType",
        SimpleOperator: 'equals',
        Value: 'dataextension'
      }
    };

    // Retrieve the parent folder
    var folderRetreiveResult = api.retrieve('DataFolder', headers,  folderFitler );

    return mapArray(folderRetreiveResult.Results, 
      function(val){ return generateFolderObject(val) });
  }

  function getFoldersByNameLike(name){
    // Filter to get the parent folder
    var folderFitler = {
      LeftOperand: {
        Property: "Name",
        SimpleOperator: 'like',
        Value: name
      },
      LogicalOperator: "AND",
      RightOperand: {
        Property: "ContentType",
        SimpleOperator: 'equals',
        Value: 'dataextension'
      }
    };

    // Retrieve the parent folder
    var folderRetreiveResult = api.retrieve('DataFolder', headers,  folderFitler );

    return mapArray(folderRetreiveResult.Results, 
      function(val){ return generateFolderObject(val) });
  }

  function getFolderByID(id){
    var folderFitler = {
      LeftOperand: {
        Property: "ID",
        SimpleOperator: 'equals',
        Value: id
      },
      LogicalOperator: "AND",
      RightOperand: {
        Property: "ContentType",
        SimpleOperator: 'equals',
        Value: 'dataextension'
      }
    };

    var folderRetreiveResult = api.retrieve('DataFolder', headers,  folderFitler);
    return mapArray(folderRetreiveResult.Results, function(val){ return generateFolderObject(val) });
    
  }

  function getInsideFolders(id){
    var folderFitler = {
      LeftOperand: {
        Property: "ParentFolder.ID",
        SimpleOperator: 'equals',
        Value: id
      },
      LogicalOperator: "AND",
      RightOperand: {
        Property: "ContentType",
        SimpleOperator: 'equals',
        Value: 'dataextension'
      }
    };

    var folderRetreiveResult = api.retrieve('DataFolder', headers,  folderFitler );
    return mapArray(folderRetreiveResult.Results, function(val){ generateFolderObject(val) });
  }

  function getDeepInsideFolders(id){
    var allFolders = [];
    var searchFolders = [id];
    var folderFitler = {
      LeftOperand: {
        Property: "ParentFolder.ID",
        SimpleOperator: 'equals',
        Value: folderParentID
      },
      LogicalOperator: "AND",
      RightOperand: {
        Property: "ContentType",
        SimpleOperator: 'equals',
        Value: 'dataextension'
      }
    }

    do{
      if(searchFolders.length < 2){
        folderFitler.LeftOperand.SimpleOperator = 'equals';
        folderFitler.LeftOperand.Value = searchFolders[0];
      }else{
        folderFitler.LeftOperand.SimpleOperator = 'IN';
        folderFitler.LeftOperand.Value = searchFolders;
      }

      var folderRetreiveResult = api.retrieve('DataFolder', headers,  folderFitler);
      
      mapArray(folderRetreiveResult.Results, function(val){ allFolders.push(generateFolderObject(val)); return null; });
      searchFolders = mapArray(folderRetreiveResult.Results, function(val){ return val.ID });
  
    }while(searchFolders.length > 0);

    return allFolders;
  }

  function mapArray(array, callback, thisArg) {
    var T, A, k;var O = array;var len = O.length;if (typeof callback !== 'function') {throw new TypeError(callback + ' is not a function');}if (arguments.length > 2) {T = thisArg;}A = [];k = 0;while (k < len) {var kValue, mappedValue;kValue = O[k];mappedValue = callback.call(T, O[k], k, O);A.push(mappedValue);k++;}return A;
  }

  function getAllFolders(){
    var DEfolderFitler = {
      Property: "ContentType",
      SimpleOperator: 'equals',
      Value: 'dataextension'
    };

    var folderRetreiveResult = api.retrieve('DataFolder', headers, DEfolderFitler);
    return mapArray(folderRetreiveResult.Results, function(val){ generateFolderObject(val) });
  }

  function generateFolderObject(obj){
    return{
      ID: obj.ID,
      Name: obj.Name,
      Description: obj.Description,
      ContentType: obj.ContentType,
      IsActive: obj.IsActive,
      IsEditable: obj.IsEditable,
      AllowChildren: obj.AllowChildren,
      CreatedDate: obj.CreatedDate,
      ModifiedDate: obj.ModifiedDate,
      ObjectID: obj.ObjectID,
      CustomerKey: obj.CustomerKey,
      ParentFolder: {
        ID: obj.ParentFolder.ID,
        CustomerKey: obj.ParentFolder.CustomerKey,
        ObjectID: obj.ParentFolder.ObjectID,
        Name: obj.ParentFolder.Name,
        Description: obj.ParentFolder.Description,
        ContentType: obj.ParentFolder.ContentType,
        IsActive: obj.ParentFolder.IsActive,
        IsEditable: obj.ParentFolder.IsEditable,
        AllowChildren: obj.ParentFolder.AllowChildren
      },
      Client: {
        ID: obj.Client.ID,
        ModifiedBy: obj.Client.ModifiedBy,
        EnterpriseID: obj.Client.EnterpriseID,
        CreatedBy: obj.Client.CreatedBy
      }
    }
  }

  function GlobalObject(configuration){
    if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
    if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  
    function getAllRetrievableFields(objectType){
      if(objectType == null || objectType == '') Platform.Function.RaiseError('objectType is required');
      var lookedResponse = 'Error: The Request Property(s) ';
  
      var result = api.describe('DataFolder');
      var propertiesName = mapArray(result.Results[0].Properties, function(val){ return val.Name });
      
      var simpleFilterName = {
        Property: propertiesName[0],
        SimpleOperator: 'equals',
        Value: 'some_value'
      }
  
      var fieldsCheck = api.retrieve(objectType, propertiesName, simpleFilterName);
      
      if(!fieldsCheck.Status || fieldsCheck.Status.substring( 0, lookedResponse.length) != lookedResponse){
        // Platform.Function.RaiseError('Not Expected response when trying to get the headers.\n' + fieldsCheck);
        return ["ID"];
      }
      
      var treatedResponse = fieldsCheck.Status.replace(lookedResponse, '');
      var regex = /(\S+)/ig; // the first index will have the invalid fields
      var notValidFields = (treatedResponse.match(regex)[0]).split(',');
  
      return filterArray(propertiesName, function(val){ return indexOf(notValidFields, val) == -1 });
    }
  
    function mapArray(array, callback, thisArg) {
      var T, A, k;var O = array;var len = O.length;if (typeof callback !== 'function') {throw new TypeError(callback + ' is not a function');}if (arguments.length > 2) {T = thisArg;}A = [];k = 0;while (k < len) {var kValue, mappedValue;kValue = O[k];mappedValue = callback.call(T, O[k], k, O);A.push(mappedValue);k++;}return A;
    }
  
    function indexOf(arr, searchElement, fromIndex) {
      var k;var o = arr;var len = o.length;if (len == 0) {return -1;}var n = fromIndex || 0;if (n >= len) {return -1;}if(n >= 0){k = n;}else{k = Math.max(len - Math.abs(n), 0);}for (; k < len; k++) {if (k in o && o[k] == searchElement)return k;}return -1;
    }
  
    function filterArray(arr, callback) {
      if (!(!!arr && Object.prototype.toString.call(arr) == '[object Array]')) {throw new TypeError();}var t = arr;var len = t.length;if (typeof callback != 'function') {throw new TypeError();}var res = [];if (arguments.length >= 3) {var thisArg = arguments[2];}for (var i = 0; i < len; i++) {var val = t[i];if (callback.call(thisArg, val, i, t)) {res.push(val);}}return res;
    }
  
    return {
      getAllRetrievableFields: getAllRetrievableFields
    }
  }

  return {
    retrieveFoldersByName: retrieveFoldersByName,
    getFolderByID: getFolderByID,
    getInsideFolders: getInsideFolders,
    getDeepInsideFolders: getDeepInsideFolders,
    getFoldersByNameLike: getFoldersByNameLike,
    getAllFolders: getAllFolders
  }
}

module.exports = DataExtensionFolders;