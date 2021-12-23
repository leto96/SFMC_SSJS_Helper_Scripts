Platform.Load('Core', '1.1');

HTTPHeader.SetValue("Access-Control-Allow-Methods","POST");
HTTPHeader.SetValue("Access-Control-Allow-Origin","http://cloud.comunicacao.serasaexperian.com.br");

function getPostData(){
  var postData = Platform.Request.GetPostData(0);
  var parsedData = Platform.Function.ParseJSON( postData );
  return parsedData;
}


/* // Alternatively you can use
  function getPostData(){
  return {
    field_in_DE1: Request.GetFormField('postedField1'),
    field_in_DE2: Request.GetFormField('postedField2')
  }
}
*/