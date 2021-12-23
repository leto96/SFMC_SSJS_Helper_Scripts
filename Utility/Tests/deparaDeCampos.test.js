var {matchFields} = require('../deparaDeCampos');
var data = require('./Data/dataDeparaDeCampos');

// Scenario
var mapFields1 = [
  {
    source: 'CANAL',
    destiny: 'canal2'
  },
  {
    source: 'Resumo Atendimento',
    destiny: 'Atendimento_resumido'
  }
];

var mapFields2 = [
  {
    source: 'fonte_do_lead',
    destiny: 'Fonte'
  }
];

var mapped1 = matchFields(data, mapFields1);
var mapped2 = matchFields(data, mapFields2);
var mapped3 = matchFields(data);

console.log('test1 result: '+ avalFunction(data, mapped1, mapFields1) ? 'Passed' : 'Failed' +'\n');
console.log('test2 result: '+ avalFunction(data, mapped2, mapFields2) ? 'Passed' : 'Failed' +'\n');
console.log('test3 result: '+ avalFunction(data, mapped3) ? 'Passed' : 'Failed' +'\n');


function avalFunction(originalArrayOfObjects1, modifiedArrayOfObjects2, modifiedFields){
  var testPassed = true;
  testPassed = originalArrayOfObjects1.length === modifiedArrayOfObjects2.length;
  var originalObject = {};
  var modifiedObject = {};
  for (let i = 0; testPassed && (i < originalArrayOfObjects1.length); i++) {
    originalObject = originalArrayOfObjects1[i];
    modifiedObject = modifiedArrayOfObjects2[i];

    for (var key in originalObject) {
      // Test if field exists
      testPassed = testPassed && ( modifiedObject[key] || ( modifiedFields && modifiedFields[key]) );
      // Test if value is equal
      testPassed = testPassed 
        && ( (modifiedObject[key] && modifiedObject[key] === originalObject[key]) 
          ||  (modifiedFields && modifiedFields[key] && modifiedObject[modifiedFields[key]] === originalObject[key] ))
    }

    originalObject = {};
    modifiedObject = {};
  }

  return testPassed;
}