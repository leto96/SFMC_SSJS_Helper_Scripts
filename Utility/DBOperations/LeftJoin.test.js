const leftData = require('./fakeDataLeft');
const rightData = require('./fakeDataRight');
const leftJoin = require('./LeftJoin');

var joined = leftJoin(leftData, rightData, 'cnpj');