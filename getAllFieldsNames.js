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
