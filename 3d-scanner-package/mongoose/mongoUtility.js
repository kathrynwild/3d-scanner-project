const captureSchema = require('./captureSchema.js');
const mongoose = require('mongoose');
const mongoPath = 'mongodb+srv://katwild:rMcxBgguXQl0nLCt@cluster0.oukzw.mongodb.net/test-db?retryWrites=true&w=majority';
const fs = require('fs');
const path = require('path');
//var captures = connectToMongo.collection('captures');

// connect to mongodb database
const connectToMongo = async () => {
    await mongoose.connect(mongoPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    return mongoose
}


// send capture data to store in database 
const addCapture = async (buffer, data, res)=>{
  await connectToMongo().then( async (mongoose) => {
        // if connection succeeds
        var url;
        try {
            // set nm to date & time in YYYY-MM-DD HH:MM:SS format
            let date_ob = new Date();     
            const user = {//fill in these vars with either yours or datas values
                name: (("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" + ("0" + date_ob.getDate()).slice(-2) + "-" + date_ob.getFullYear() + " " + ("0" + date_ob.getHours()).slice(-2) + ":" + ("0" + date_ob.getMinutes()).slice(-2) + ":" + ("0" + date_ob.getSeconds()).slice(-2)),
                url: path.join(__dirname, '../public/Images/'),
                zmin: data.zmin,
                zmax: data.zmax,
                numStairs: data.numStairs,
                width: data.width,
                height : data.height
            }
            
            
            var cap = new captureSchema(user);
            cap.url+=cap._id + '.png';            // set url
            
            var result = await cap.save();
            if(result){
              fs.writeFileSync(result.url, buffer, 'base64'); //save file to server
            }
          res.json("success");
        } finally {
            mongoose.connection.close()
        }
      return url;
    }).catch(err => {
      console.log('Failed to add file: ' + err);
    })
}

// returns array capture names and _id from database
const findCaptures = async (res) => {
    var capturesArr;
    await connectToMongo().then( async (mongoose) => {
        // if connection succeeds
        try {
          // all captures stored in result
            capturesArr = await captureSchema.find()

              if(capturesArr){
                res.json({success: true, data: capturesArr});
              }
              else{
                res.json({success: false})
              }
            
        } finally {
            mongoose.connection.close()
        }
            //return capturesArr;
      }).catch(err => {
      console.log('Failed to retrieve data: ' + err);
    })
}


// change name of capture in database
const changeName = async (data, res)=>{
  await connectToMongo().then( async (mongoose) => {
        // if connection succeeds
        try {
            await captureSchema.updateOne({
               _id: data.id 
            },
            {
                name: data.newName
            },{
                useFindAndModify: false,
                new: true
            })
          res.json({success: true});
        } finally {
            mongoose.connection.close()
        }    
    }).catch(err => {
      console.log('Failed to change file: ' + err);
      res.json({success: false});
    })
}

const deleteCapture = async (data, res) =>{
  await connectToMongo().then(async mongoose => {
    try{
      if(!data.id){
        res.json({successs: false, errorText: "Please provide capture id"});
        return
      }
      var result = await captureSchema.findByIdAndRemove(data.id,{
        useFindAndModify: false
      });
      if(result){
        fs.unlink(result.url, err =>{
          if(err){
            res.json({success: false, errorText: err});
          }
          else{
            res.json({success: true});
          }
        });      
      }
      else{
        res.json({success: false, errorText: 'Failure to delete capture'})
      }
    }
    finally{
      mongoose.connection.close();
    }
  }).catch(err => {
    console.log("Error deleting capture: "+ err);
  })
}

module.exports = {addCapture, findCaptures, changeName, deleteCapture}