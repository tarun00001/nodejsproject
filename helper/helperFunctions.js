const mongoose = require('mongoose');

const makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const removeAllSpecialChars = (text) => {
  return text.replace(/[^a-zA-Z]/g, "");
}

const checkCollectionName= async (projectName) => {
  // const collecctionName = await mongoose.connection.db.getCollectionNames()
  
  const collectionNameList = (await mongoose.connection.db.listCollections().toArray()).map(name => name.name)
  
  const isCollectionExist = collectionNameList.filter(collectionName => collectionName !== projectName); 
  console.log(isCollectionExist)

  if (!isCollectionExist) return true

  return false
}


module.exports = {
  makeid,
  removeAllSpecialChars,
  checkCollectionName
}