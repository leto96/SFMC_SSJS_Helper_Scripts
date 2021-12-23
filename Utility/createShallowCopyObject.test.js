var createShallowCopyObject = require('./createShallowCopyObject');

// Tests
var testsResults = [];
var testResult = {};

var objectToCopy = {
  numericvalue: 1,
  stringvalue: 'string',
  booleanvalue: true
}

// Test 1
testResult.descriptive = 'Copied by reference should have both the same value when a prop in one object is modified';
testResult.passed = false;

var objectCopiedDirectly = objectToCopy;
objectCopiedDirectly.numericvalue = 2;
if(objectCopiedDirectly.numericvalue === objectToCopy.numericvalue){
  testResult.passed = true;
}
testsResults.push(testResult);
testResult = {};


// Test 1
testResult.descriptive = 'Copied by values should have differents values when a prop in one object is modified';
testResult.passed = false;
var objectFunctionCopied = createShallowCopyObject(objectToCopy);

objectFunctionCopied.numericvalue = 3;
if(objectFunctionCopied.numericvalue !== objectToCopy.numericvalue){
  testResult.passed = true;
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