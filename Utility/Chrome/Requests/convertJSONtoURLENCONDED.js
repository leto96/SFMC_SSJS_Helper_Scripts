function jsonToQueryString(obj) {
  var str = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))                  
      // console.log(key + " -> " + obj[key]);
    }
  }
  return str.join("&"); 
}