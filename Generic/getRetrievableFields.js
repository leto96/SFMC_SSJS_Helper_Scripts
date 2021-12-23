// <script runat=server>
  Platform.Load("Core", "1.1.5");
  var api = new Script.Util.WSProxy();
  var objectType = 'DataFolder';
  try{
    var global = GlobalObject({api: api});
    
    Write('\nfields in ' + objectType + '\n');
    Write(Stringify(global.getAllRetrievableFields(objectType)) + '\n');
  }catch(e){
    Write(Stringify(e));
  }

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
      // Platform.Function.RaiseError('Not Expected response.\n' + fieldsCheck);
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

// </script>