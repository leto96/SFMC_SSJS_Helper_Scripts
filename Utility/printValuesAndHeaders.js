function printRecordsSeparatedValues(data, headers, separator){
  // Data must be an array of objects key-value pairs
  // headers must be an array of strings
  var delimiter = separator;
  if(separator === undefined || separator === null){ delimiter = ','};

  Write("<br />");
  for(var i = 0; i < headers.length; i ++){
    Write(headers[i]);
    if(i !== headers.length - 1) Write(delimiter);
  }
  
  Write("<br />");
  for(var i = 0; i < data.length; i ++){
    // Print values
    for(var j = 0; j < headers.length; j++){
      Write(data[i][headers[j]]);
      if(j !== headers.length - 1) Write(delimiter);
    }
    Write("<br />");
  }
}