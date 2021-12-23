  var today = new Date();
  var dtStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1); // start hour (with 00 minutes and 00 seconds)
  var dtEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // finish hour (with 00 minutes and 00 seconds)

  var filterOrderDate = {
    Property: 'Date',
    SimpleOperator: 'between',
    Value: [dtStart, dtEnd]
  }