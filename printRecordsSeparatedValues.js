function printRecordsSeparatedValues(data, headers, separator){
  // Data must be an array of objects key-value pairs
  // headers must be an array of strings
  var delimiter;
  if(separator === undefined || separator === null) delimiter = ',';

  Write("<br />");
  for(var i = 0; i < headers.length; i ++){
    Write(headers[i]);
    if(i !== headers.length - 1) Write(delimiter);
  }
  
  Write("<br />");
  for(var i = 0; i < data.length; i ++){
    // Print values
    Write(data[i].Name);
    Write(delimiter);
    Write(data[i].IsPrimaryKey);
    Write(delimiter);
    Write(data[i].FieldType);
    Write(delimiter);
    Write(data[i].MaxLength);
    Write("<br />");
  }
  Write("<br />");
}