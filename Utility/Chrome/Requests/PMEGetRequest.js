var responseText;
var responseParsed;
var xhttp = new XMLHttpRequest();
var targetURL = 'https://cloud.comunicacao.serasaexperian.com.br/dev_resourcepme'
xhttp.open("GET", targetURL, true);
xhttp.setRequestHeader("Accept", "application/json, text/javascript, */*; q=0.01");
xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
xhttp.onload = function() {
  responseText = xhttp.responseText;
  responseParsed = JSON.parse(xhttp.responseText);
  console.log('Load Complete');
}
xhttp.send();