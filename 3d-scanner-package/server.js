 // server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const path = require("path");
const fs = require('fs');
const fileUpload = require('express-fileupload');

app.use(express.json());
app.use(fileUpload());



// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use('/three', express.static(path.join(__dirname, '/node_modules/three')));
var encoding = require('./public/js/EncodingExamples');
const mongo = require('./mongoose/mongoUtility');


// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

//get request, returns array capture names and _id from database
app.get("/names", (request,response)=>{  
  mongo.findCaptures(response);
});

//get request, returns the requested capture file
app.get('/capture/:id?',(request,response)=>{
  var CaptureData = mongo.getCaptureInfo(request.params.filename);
});

// send capture to database
app.post('/picapture', (req, res) => {
  mongo.addCapture(req.files.fileupload.data, req.body, res);
});

// call rename function in mongoUtility to change capture name in web viewer
app.post('/rename', (req,res)=>{//sending in id and newName
  mongo.changeName(req.body, res);
})

app.post('/delete', (req, res) =>{
  mongo.deleteCapture(req.body, res);
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});