/* Para quando resgatar os campos através da função do SSJS, usar para pegar os atributos necessários */

function getMetaDataFromFields(results, metadata){
  // Results são os resultados da busca pelos campos
  // metadata são os dados desejados dos campos
  var fieldsData = [];
  var auxData = {};
  for(var j = 0; j < results.length; j++){
    var result = results[j];
    for(var i = 0; i < metadata.length ; i++){
      console.log(result[metadata[i]]);
      auxData[ metadata[i] ] = result[metadata[i]];
    }
    fieldsData.push(auxData);
    auxData = {};
  }

  return fieldsData;
}