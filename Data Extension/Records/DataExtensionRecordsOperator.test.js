// Testar passar não passar options para o retrieve
var DataExtensionRecordsOperator = require('./DataExtensionRecordsOperator');

// Tests
var testsResults = [];
var testResult = {};

// Test 1
testResult.descriptive = 'Start without initial configs';
testResult.passed = false;
var initialConfig = {};

try {
  var de = DataExtensionRecordsOperator();
} catch (error) {
  if(error.message == 'An configuration Object is required'){
    testResult.passed = true;
  }
}
testsResults.push(testResult);
testResult = {};

// Test 2
testResult.descriptive = 'Do not send api Object';
testResult.passed = false;
initialConfig = {};

try {
  var de = DataExtensionRecordsOperator(initialConfig);
} catch (error) {
  if(error.message == 'Api attribute is required'){
    testResult.passed = true;
  }
}
testsResults.push(testResult);
testResult = {};

// Test 3
testResult.descriptive = 'Do not send dataExtensionCustomerKey';
testResult.passed = false;
initialConfig = { api: {} };

try {
  var de = DataExtensionRecordsOperator(initialConfig);
} catch (error) {
  if(error.message == 'dataExtensionCustomerKey attribute is required'){
    testResult.passed = true;
  }
}
testsResults.push(testResult);
testResult = {};

// Test 4
testResult.descriptive = 'Send dataExtensionCustomerKey as not a string';
testResult.passed = false;
initialConfig = { api: {}, dataExtensionCustomerKey: {} };

try {
  var de = DataExtensionRecordsOperator(initialConfig);
} catch (error) {
  if(error.message == 'dataExtensionCustomerKey must be a String'){
    testResult.passed = true;
  }
}
testsResults.push(testResult);
testResult = {};

// Test 5
testResult.descriptive = 'Create successfully';
testResult.passed = false;
initialConfig = { api: {}, dataExtensionCustomerKey: 'CustomerKey' };

try {
  var de = DataExtensionRecordsOperator(initialConfig);
  testResult.passed = true;
} catch (error) {
  // Do nothing, test failed
}
testsResults.push(testResult);
testResult = {};

// End tests
displayResults(testsResults);



function displayResults(results){
  console.log('');
  results.forEach((element, i) => {
    console.log('' + (i+1) + ': ' + (element.passed ? 'Passed' : 'Failed') + ' - ' + element.descriptive);
  });
  console.log('');

}