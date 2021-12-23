// Auxiliar to receive an array of records and print sequentially as text to be copied from chrome console
function BatchArrayOfObjects(arrayOfObjects, batchesSize){
  this.arrayOfObjects = arrayOfObjects;
  this.batchesSize = batchesSize;
  // this.fields = fields;
  this.currentBatchIndex = 0;
  this.numberOfBatches = Math.ceil(arrayOfObjects.length / batchesSize);

 this.printNextBatch = function(){
    if( this.currentBatchIndex >= this.numberOfBatches ){
      console.log(`Number of Batches exceeded.\nTotal Batches: ${this.numberOfBatches}\nLast Batch Printed: ${this.currentBatchIndex}`);
      console.log(`Reseting batch`);
      this.resetBatchPrint();
    }
      
      var batchStartIndex = this.batchesSize * this.currentBatchIndex;
      var batchLastIndex;
      
      if( this.batchesSize * (this.currentBatchIndex + 1) - 1 < arrayOfObjects.length){
        batchLastIndex = this.batchesSize * (this.currentBatchIndex + 1) - 1;
      }else{
        batchLastIndex = arrayOfObjects.length - 1;
      }
      
      var bigStream = '';
      for(var i = batchStartIndex; i <= batchLastIndex; i++){
        let currentObject = this.arrayOfObjects[i];
        bigStream = JSON.stringify(currentObject)+','+bigStream;
      }
      console.log(bigStream);
      this.currentBatchIndex++;
  }

  this.resetBatchPrint = function(){
    this.currentBatchIndex = 0;
  } 
}
/* 
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
} */