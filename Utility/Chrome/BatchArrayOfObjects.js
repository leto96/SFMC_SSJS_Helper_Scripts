// print batch data to copy. For large results, to copy/paste data in excel in order to analise
function BatchArrayOfObjects(arrayOfObjects, batchesSize){
  this.arrayOfObjects = arrayOfObjects;
  this.batchesSize = batchesSize;
  this.currentBatchIndex = 0;
  this.numberOfBatches = Math.ceil(arrayOfObjects.length / batchesSize);
};

BatchArrayOfObjects.prototype.printNextBatch = function(){
  if( this.currentBatchIndex >= this.numberOfBatches ){
    console.log(`Number of Batches exceeded.\nTotal Batches: ${this.numberOfBatches}\nLast Batch Printed: ${this.currentBatchIndex}`);
  }

  var batchStartIndex = this.batchesSize * this.currentBatchIndex;
  var batchLastIndex;
  
  if( this.batchesSize * (this.currentBatchIndex + 1) - 1 < arrayOfObjects.length){
    batchLastIndex = this.batchesSize * (this.currentBatchIndex + 1) - 1;
  }else{
    batchLastIndex = arrayOfObjects.length - 1;
  }

  console.log('LeadID,Origem,Origem_Categoria');
  for(var i = batchStartIndex; i <= batchLastIndex; i++){
    let currentObject = this.arrayOfObjects[i];
    console.log(`${currentObject.LeadID},${currentObject.ORIGEM},${currentObject.ORIGEM_CATEGORIA}`);
  }
  this.currentBatchIndex++;
}

BatchArrayOfObjects.prototype.resetBatchPrint = function(){
  this.currentBatchIndex = 0;
}