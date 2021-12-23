function formatDateToText(date){
  var day = date.getDate() // Returns the date
  var month = date.getMonth() + 1; // Returns the month
  var year = date.getFullYear() // Returns the year
  
  if(day < 10){
    day = '0' + day;
  }

  if(month < 10){
    month = '0' + month;
  }

  return '' + day + '/' + month + '/' + year;
}