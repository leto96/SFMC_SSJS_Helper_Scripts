// <script runat="server">

// 
// folder: contenttype = queryactivity
// QueryDefinition: 
// - Name
// - CategoryID
// - DataExtensionTarget
// - ObjectID

Platform("Core", "2.0");
var api = new Script.Util.WSProxy();

try {
  var folderManipulator = QueryFolders({api: api});
  var allFolders = reduceFolders(folderManipulator.getAllFolders());
  var queryDefinition = QueryDefinitionCustom({api: api});
  var allQueries = reduceQueries(queryDefinition.retrieveAllQueries());

  Write(Stringify({folders: allFolders, queries: allQueries}));
  
} catch (error) {
  Write('error\n');
  Write(Stringify(error.message));
}

// --------------- MAIN -------------------
function retrieveDEByNameLike(api){
  var postedData = getPostData();
  var DENameToLookLike = postedData.name;
  
  if( DENameToLookLike == null || DENameToLookLike == undefined || DENameToLookLike.length < 4 ){
    Platform.Function.RaiseError('INVALID_SEARCH_NAME');
  }

  var DEsFound = DataExtensionCollection({api:api}).getDEWithNameLike(DENameToLookLike);
  return DEsFound;
}

function retrieveDEInsideFolder(api) {
  var postedData = getPostData();
  var folderIDToLookUp = postedData.folderID;
  
  if( folderIDToLookUp == null || folderIDToLookUp == undefined){
    Platform.Function.RaiseError('INVALID_ID');
  }

  var DEsFound = DataExtensionCollection({api:api}).getDEsInisdeFolder(folderIDToLookUp);
  return DEsFound;
}

function retrieveFolderByID(api){
  var postedData = getPostData();
  var folderIdToLookUp = postedData.id;
  
  if( folderIdToLookUp == null || folderIdToLookUp == undefined ){
    Platform.Function.RaiseError('INVALID_ID');
  }

  var foldersFound = DataExtensionFolders({api: api}).getFolderByID(folderIdToLookUp);
  return foldersFound;
}

function retrieveChildrenFolderByID(api){
  var postedData = getPostData();
  var folderIdToLookUp = postedData.id;
  
  if( folderIdToLookUp == null || folderIdToLookUp == undefined ){
    Platform.Function.RaiseError('INVALID_ID');
  }

  var foldersFound = DataExtensionFolders({api: api}).getInsideFolders(folderIdToLookUp);
  return foldersFound;
}

function retrieveFolderByNameLike(api){
  var postedData = getPostData();
  var folderNameToLookLike = postedData.name;
  
  if( folderNameToLookLike == null || folderNameToLookLike == undefined || folderNameToLookLike.length < 4 ){
    Platform.Function.RaiseError('INVALID_SEARCH_NAME');
  }

  var foldersFound = DataExtensionFolders({api: api}).getFoldersByNameLike(folderNameToLookLike);
  return foldersFound;
}

// ---------------- AUX FUNCTIONS ----------------

// Get data in post
function getPostData(){
  var postData = Platform.Request.GetPostData(0);
  var parsedData = Platform.Function.ParseJSON( postData );
  return parsedData;
}

function reduceFolders(folders){
  return mapArray(folders, function(folder) {
    return {
      Name: folder.Name,
      ID: folder.ID,
      ParentFolder: { ID: folder.ParentFolder.ID },
      CreatedDate: folder.CreatedDate
    };
  });
}

function reduceQueries(queries){
  return mapArray(queries, function(query) {
    return {
      Name: query.Name,
      Description: query.Description,
      CustomerKey: query.CustomerKey,
      CategoryID: query.CategoryID,
      CreatedDate: query.CreatedDate,
      ObjectID: query.ObjectID,
      DataExtensionTarget: {
        Name: query.DataExtensionTarget.Name
      }
    };
  });
}

// ---------------- Library ----------------

// Data Extension Folder Library
function QueryFolders(configuration){
  if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
  if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  
  var api = configuration.api;
  var contentType = 'queryactivity';
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
        Value: contentType
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
        Value: contentType
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
        Value: contentType
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
        Value: contentType
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
        Value: contentType
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
      Value: contentType
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

// Aux to use Array.map
function mapArray(array, callback, thisArg) {
  var T, A, k;var O = array;var len = O.length;if (typeof callback !== 'function') {throw new TypeError(callback + ' is not a function');}if (arguments.length > 2) {T = thisArg;}A = [];k = 0;while (k < len) {var kValue, mappedValue;kValue = O[k];mappedValue = callback.call(T, O[k], k, O);A.push(mappedValue);k++;}return A;
}

function QueryDefinitionCustom(configuration){
  if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
  if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  var objectType = 'QueryDefinition';

  var api = configuration.api;
  var propertiesMetaData = GlobalObject({api: api});
  var headers = propertiesMetaData.getAllRetrievableFields(objectType);
  
  // must be fixed
  function GlobalObject(configuration){
    if(!configuration) Platform.Function.RaiseError('An configuration Object is required');
    if(!configuration.api) Platform.Function.RaiseError('Api attribute is required');
  
    function getAllRetrievableFields(objectType){
      if(objectType == null || objectType == '') Platform.Function.RaiseError('objectType is required');
      var lookedResponse = 'Error: The Request Property(s) ';
  
      var result = api.describe(objectType);
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

  function retrieveQuery(prop, operator, value){
    var retrieveFilter = {
      Property: prop,
      SimpleOperator: operator,
      Value: value
    };

    var queryDefinition = api.retrieve(objectType, [
      "QueryText",
      "TargetType",
      "TargetUpdateType",
      "FileSpec",
      "FileType",
      "Status",
      "CategoryID",
      "Name",
      "Description",
      "Client.ID",
      "CreatedDate",
      "ModifiedDate",
      "ObjectID",
      "CustomerKey",
      "DataExtensionTarget.Name",
      "DataExtensionTarget.Description",
      "DataExtensionTarget.CustomerKey",
      ], retrieveFilter
    );
    return queryDefinition.Results;
  }

  function retrieveAllQueries(){
    var queryDefinition = api.retrieve(objectType, [
      "QueryText",
      "TargetType",
      "TargetUpdateType",
      "FileSpec",
      "FileType",
      "Status",
      "CategoryID",
      "Name",
      "Description",
      "Client.ID",
      "CreatedDate",
      "ModifiedDate",
      "ObjectID",
      "CustomerKey",
      "DataExtensionTarget.Name",
      "DataExtensionTarget.Description",
      "DataExtensionTarget.CustomerKey",
      ], retrieveFilter
    );
    
    return queryDefinition.Results;
  }

  return {
    getRetrievableProperties: headers,
    retrieveQuery: retrieveQuery,
    retrieveAllQueries: retrieveAllQueries
  }
}
// </script>