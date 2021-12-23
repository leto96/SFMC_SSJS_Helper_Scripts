function retrieveAllRecords(name) {
  
  var prox = new Script.Util.WSProxy();

  var cols = retrieveFieldNames(name);

  var config = {
      name: name,
      cols: cols
  }

  var records = [],
      moreData = true,
      reqID = data = null;

  while (moreData) {

      moreData = false;

      if (reqID == null) {
          data = prox.retrieve("DataExtensionObject[" + config.name + "]", config.cols);
      } else {
          data = prox.getNextBatch("DataExtensionObject[" + config.name + "]", reqID);
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