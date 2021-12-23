// <script runat=server>
  Platform.Load("Core", "1.1.5");
  var api = new Script.Util.WSProxy();
  // api.setClientId({ "ID": 100025290 }); // Conta pai
  var mainDEName = "DE_to_replicate_Name"; // DE to Replicate
  var replicateDENamePrefix = 'Replicated - '; // DE will have the same name, but with this prefix
  var folderNameToReplicate = 'Data Extensions';
  var folderToReplicateDE; // Folder CategoryID

  var filterFieldsInClone = false;
  var fieldsToKeepInClone = [
    'campo1',
    'campo2'
  ];

  var mainDECols = ["Name", "CategoryID"];
  var mainDEFieldsCols = ["Name", "IsPrimaryKey","FieldType", "MaxLength", "IsRequired", "DefaultValue"];
  

  try{
    var des = DataExtensionCollection({ api: api });
    var mainDEFound = des.getDEWithNameLike(mainDEName);
    if( mainDEFound.length == 0 ){
      Platform.Function.RaiseError('No DE Found: ' + mainDEName);
    }
    var mainDECustomerKey = mainDEFound[0].CustomerKey;
    var mainDEFilter = {
      Property: 'CustomerKey',
      SimpleOperator: 'equals',
      Value: mainDECustomerKey
    }
    var mainDEFieldsFilter = {
      Property: 'DataExtension.CustomerKey',
      SimpleOperator: 'equals',
      Value: mainDECustomerKey
    }
    
    var folders = DataExtensionFolders({api: api});
    var foldersWithNameFound = folders.retrieveFoldersByName(folderNameToReplicate);
    if( foldersWithNameFound.length == 0 ){
      Platform.Function.RaiseError('No Folder Found: ' + folderNameToReplicate);
    }
    
    if(folderToReplicateDE == null || folderToReplicateDE == undefined){
      folderToReplicateDE = foldersWithNameFound[0].ID;
    }
    // Check if Main DE exists
    var retrieveMainDE = api.retrieve("DataExtension", mainDECols, mainDEFilter);
    printObjectWithSpaces('Result main DE retrieve', retrieveMainDE.length);
    
    // If we find the DE, check if doesn't already exists the replicated DE
    if(retrieveMainDE.Results.length > 0){
      // Get the name from the Main DE, prepend the replicated Prefix and try find if DE exist 
      var resultRetrieveMainDE = retrieveMainDE.Results[0];
      var replicateDEName = replicateDENamePrefix + resultRetrieveMainDE.Name;
      var replicateDECols = ['Name', 'CategoryID'];
      var filterReplicateDE = {
        Property: 'Name',
        SimpleOperator: 'equals',
        Value: replicateDEName
      }
      printObjectWithSpaces('Replicate DE name', replicateDEName);

      var retrieveReplicateDE = api.retrieve("DataExtension", replicateDECols, filterReplicateDE);
      printObjectWithSpaces('Result Replicated DE retrieve', retrieveReplicateDE);
      // If no result is found, then we need to create the DE
      if(retrieveReplicateDE.Results.length != 0){
        // Replicate DE already exist
        // Find the path to DE
        var fullPathDE = findDEFullPath(replicateDEName);
        printObjectWithSpaces('Replicate DE already exists', fullPathDE);
        return;
      }
      
    }else{
      // If Doesn't find the Main DE generate an error
      Platform.Function.RaiseError('Didn\'t find the main DE to create a Copy');
      return;
    }

    var mainDEFields = api.retrieve("DataExtensionField", mainDEFieldsCols, mainDEFieldsFilter);
    // printObjectWithSpaces('Main DE Fields', mainDEFields);
    var clonedFields = cloneFieldsFromRetrieve(mainDEFields.Results);
    // printObjectWithSpaces('clonedFields', clonedFields);
    var filteredClonedFields = filterArray(clonedFields, function(val){
      return indexOf(fieldsToKeepInClone, val.Name) != -1;
    });

    // Duplicated DE
    var DuplicateDE = {
      "CustomerKey": String(Platform.Function.GUID()).toUpperCase(),
      "Name": replicateDEName,
      "Description": "Duplicated DE to Debug",
      "CategoryID": folderToReplicateDE,
      "Fields": filteredClonedFields
    }

    // Create duplicated DE
    var duplicateResult = api.createItem("DataExtension", DuplicateDE);
    printObjectWithSpaces('duplicateResult', duplicateResult);

  }catch(e){
    Write('error' + '\n');
    Write(Stringify(e) + '\n\n');
  }

  function printRecordsSeparatedValues(data, headers, separator){
    // Data must be an array of objects key-value pairs
    // headers must be an array of strings
    var delimiter = separator;
    if(separator === undefined || separator === null){ delimiter = ','};

    Write("<br />");
    for(var i = 0; i < headers.length; i ++){
      Write(headers[i]);
      if(i !== headers.length - 1) Write(delimiter);
    }
    
    Write("<br />");
    for(var i = 0; i < data.length; i ++){
      // Print values
      for(var j = 0; j < headers.length; j++){
        Write(data[i][headers[j]]);
        if(j !== headers.length - 1) Write(delimiter);
      }
      Write("<br />");
    }
  }
  
  // Clone fields from retrieve
  function cloneFieldsFromRetrieve(fields){
    var mappedFields = [];
    var mapFieldsAux = {};
    var auxField = {};

    for(var i = 0; i < fields.length; i++){
      auxField = fields[i];
      mapFieldsAux.Name = auxField.Name;
      mapFieldsAux.FieldType = auxField.FieldType;
      mapFieldsAux.IsPrimaryKey = auxField.IsPrimaryKey;
      mapFieldsAux.IsRequired = auxField.IsRequired;

      if(mapFieldsAux.DefaultValue != null && mapFieldsAux.DefaultValue == ""){
        mapFieldsAux.DefaultValue = auxField.DefaultValue;
      }

      if(mapFieldsAux.FieldType == "Text"){
        mapFieldsAux.MaxLength = auxField.MaxLength;
      }

      if(mapFieldsAux.FieldType == "Decimal"){
        mapFieldsAux.MaxLength = auxField.MaxLength;
        mapFieldsAux.Scale = auxField.Scale;
      }

      mappedFields.push(mapFieldsAux);
      mapFieldsAux = {};
    }
    return mappedFields;
  }

  // Aux functions
  function printObjectWithSpaces(title, objectToPrint){
    Write(title + '\n');
    Write(Stringify(objectToPrint) + '\n\n');
  }

  function findDEFullPath(DEname, DEFolderID){
    var DEName = DEname;
    var folderParentID;
    var DEfullpath = [];

    if(DEFolderID == null || DEFolderID == undefined){
      var foundDE = api.retrieve('DataExtension', ['Name', 'CustomerKey', "CategoryID"],  DataExtensionFitler );
      // Error: DE not found
      if(foundDE.Results.length == 0){
        Platform.Function.RaiseError('DE not Found');
        return;
      }
      // DEName = foundDE.Results[0].Name;
      folderParentID = foundDE.Results[0].CategoryID;
      DEfullpath.push(DEName);
    }else{
      folderParentID = DEFolderID;
    }

    do{
      // Filter to get the parent folder
      var folderFitler = {
        LeftOperand: {
          Property: "ID",
          SimpleOperator: 'equals',
          Value: folderParentID
        },
        LogicalOperator: "AND",
        RightOperand: {
          Property: "ContentType",
          SimpleOperator: 'equals',
          Value: 'dataextension'
        }
      };

      // Retrieve the parent folder
      var folderRetreiveResult = api.retrieve('DataFolder', ["ID", 'ParentFolder.ID', 'Name'],  folderFitler );
      currentFolderName = folderRetreiveResult.Results[0].Name;
      folderParentID = folderRetreiveResult.Results[0]["ParentFolder"]["ID"];
      DEfullpath.unshift(currentFolderName);

    }while(folderParentID != 0)
    
    // Build Path String
    var DEfullpathString = DEfullpath.join(' -> ');
    return DEfullpathString;
  }

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
  
  function filterArray(arr, callback) {
    if (!(!!arr && Object.prototype.toString.call(arr) == '[object Array]')) {throw new TypeError();}var t = arr;var len = t.length;if (typeof callback != 'function') {throw new TypeError();}var res = [];if (arguments.length >= 3) {var thisArg = arguments[2];}for (var i = 0; i < len; i++) {var val = t[i];if (callback.call(thisArg, val, i, t)) {res.push(val);}}return res;
  }

  function indexOf(arr, searchElement, fromIndex) {
    var k;var o = arr;var len = o.length;if (len == 0) {return -1;}var n = fromIndex || 0;if (n >= len) {return -1;}if(n >= 0){k = n;}else{k = Math.max(len - Math.abs(n), 0);}for (; k < len; k++) {if (k in o && o[k] == searchElement)return k;}return -1;
  }
  
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
  
// </script>