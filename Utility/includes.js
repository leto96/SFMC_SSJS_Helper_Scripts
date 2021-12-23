function includes(value, array){
  for (var i = 0; i < array.length; i++) {
    if(value == array[i]){
      return i;
    }
  }
  return -1;
}