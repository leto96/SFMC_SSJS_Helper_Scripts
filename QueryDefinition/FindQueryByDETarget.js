//<script runat=server>
Platform.Load("Core", "1.1.5");
var api = new Script.Util.WSProxy();
try {

  var simpleFilter = {
    Property: 'DataExtensionTarget.Name',
    SimpleOperator: 'equals',
    Value: 'Tb_Base_Quarentena'
  }

    var queryDefinition = api.retrieve('QueryDefinition', [
      "QueryText",
      "Name",
      "Description",
      "DataExtensionTarget.Name",
      "DataExtensionTarget.CustomerKey",
      ], simpleFilter
    );

    var res = [];
    for (var i = 0; i < queryDefinition.Results.length; i++) {
      res.push({
        Name: queryDefinition.Results[i].Name,
        QueryText: queryDefinition.Results[i].QueryText,
        DataExtensionTargetName: queryDefinition.Results[i].DataExtensionTarget.Name,
        DataExtensionTargetCustomerKey: queryDefinition.Results[i].DataExtensionTarget.CustomerKey
      });
    }
    Write('res' + '\n');
    Write(Stringify(res) + '\n\n');;
} catch (error) {
  Write('objectToPrint' + '\n');
  Write(Stringify(objectToPrint) + '\n\n');
}
//</script>