function mapKey(ObjectTomap, keyName){

  var Objectmapped = {};
  for(var i = 0; i < ObjectTomap.length; i++){
    // Makes the field value be the key, e.g.:
    // { id: 1, name: 'example1' } -> { 1 : { id: 1, name: 'example1' } }
    // { id: 2, name: 'example2' } -> { 2 : { id: 1, name: 'example1' } }
    Objectmapped[ ObjectTomap[i][keyName] ] = ObjectTomap[i];
  }
  return Objectmapped;
}