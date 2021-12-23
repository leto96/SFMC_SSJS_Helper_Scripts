// var createShallowCopyObject = require('../createShallowCopyObject');
const isArray = require('../isArray');
var isLiteralObject = require('../isLiteralObject');
var leftJoinData = require('./LeftJoinSelectingFields');
var { leftObjectsExample, rightObjectsExample } = require('./LeftJoinSelectingFieldsTestData');

// Initializing test vars...
var testsResults = [];
var testResult = {};

// Test 1
testResult.descriptive = 'First arg is not an object';
testResult.passed = false;

try {
  var joinedLeftObject = leftJoinData('', rightObjectsExample, 'id', 'user_id');
} catch (error) {
  if(error.message === 'First argument must be an array of objects (left object)') 
  testResult.passed = true;
}
testsResults.push(testResult);
testResult = {};

// Test 2
testResult.descriptive = 'Second arg is not an object';
testResult.passed = false;

try {
  var joinedLeftObject = leftJoinData(leftObjectsExample, '', 'id', 'user_id');
} catch (error) {
  if(error.message === 'Second argument must be an array of objects (right object)') 
  testResult.passed = true;
}
testsResults.push(testResult);
testResult = {};

// Test 3
testResult.descriptive = 'Third arg is not an string';
testResult.passed = false;

try {
  var joinedLeftObject = leftJoinData(leftObjectsExample, rightObjectsExample, 1, 'id');
} catch (error) {
  if(error.message === 'Third argument must be an string') 
  testResult.passed = true;
}
testsResults.push(testResult);
testResult = {};

// Test 4
testResult.descriptive = 'Fourth arg is not an string';
testResult.passed = false;

try {
  var joinedLeftObject = leftJoinData(leftObjectsExample, rightObjectsExample, 'user_id', 4);
} catch (error) {
  if(error.message === 'Fourth argument must be an string') 
  testResult.passed = true;
}
testsResults.push(testResult);
testResult = {};

// Test 5
testResult.descriptive = 'There is an value in first argument array that is not an object';
testResult.passed = false;
var wrongObject = [
  {
    name: 'name'
  },
  'a',
  {
    name: 'name'
  }
];

try {
  var joinedLeftObject = leftJoinData(wrongObject, rightObjectsExample, 'user_id', 'id');
} catch (error) {
  if(error.message === 'First argument must be an array of objects (left object)') 
  testResult.passed = true;
}
testsResults.push(testResult);
testResult = {};

// Test 6
testResult.descriptive = 'There is an value in second argument array that is not an object';
testResult.passed = false;
var wrongObject = [
  {
    name: 'name'
  },
  'a',
  {
    name: 'name'
  }
];

try {
  var joinedLeftObject = leftJoinData(leftObjectsExample, wrongObject, 'user_id', 'id');
} catch (error) {
  if(error.message === 'Second argument must be an array of objects (right object)') 
  testResult.passed = true;
}
testsResults.push(testResult);
testResult = {};

// Test 7
testResult.descriptive = 'Successfully joined';
testResult.passed = true;

try {
  var passed = testResult.passed;
  var joinedLeftObject = leftJoinData(leftObjectsExample, rightObjectsExample, 'user_id', 'id');
  passed = passed && isArray(joinedLeftObject);
  passed = passed && joinedLeftObject[0].user_id.id === rightObjectsExample[0].id; // joined
  passed = passed && joinedLeftObject[1].user_id.id === rightObjectsExample[2].id; // joined
  passed = passed && typeof joinedLeftObject[2].user_id === 'string'; // not joined
  
  // if new array of objects is modified, the original should not be modified
  leftObjectsExample[0].value = 90;
  passed = passed && leftObjectsExample[0].value !== joinedLeftObject[0].value;
  
} catch (error) {
  testResult.passed = false;
}
testResult.passed = passed;
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