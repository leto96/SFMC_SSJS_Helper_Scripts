const usernameColumn = 5;
const SSOEnabledColumn = 9;
const arr = [];

let usernameDiv = document.querySelector(`#grid1_cell_0_${usernameColumn} div`);
let SSOEnabledDiv = document.querySelector(`#grid1_cell_0_${SSOEnabledColumn} div`);
for(let i = 1; usernameDiv != null; i++){
  // Print as CSV
  arr.push(usernameDiv.innerText+','+SSOEnabledDiv.innerText);
  usernameDiv = document.querySelector(`#grid1_cell_${i}_${usernameColumn} div`);
  SSOEnabledDiv = document.querySelector(`#grid1_cell_${i}_${SSOEnabledColumn} div`);
}

console.log('Username,SSOEnabled\n'+arr.join('\n'));