import dataUtility from './dataUtility.js'

function getCapture(capture, callback){
  console.log(capture.name);
  var image = new Image(capture.width,capture.height*2);
  image.onload = () =>{
    console.log(capture);
    var data = dataUtility.getDecodedDataFromImage(image, capture.zmin, capture.zmax, capture.numStairs);
    callback(data.vertices, data.colorData);
  }
  var paths = capture.url.split('/');
  var url = '/' + paths[paths.length-2] + '/' + paths[paths.length-1];
  console.log(url);
  image.src = url;//'/Images/testFromUpload.png';
}

function getCaptureNames(callback){
  // fetch the initial list of dreams
fetch("/names")
  .then(response =>{
  if(!response.ok){
    console.log('Failure to get names');
  }
  else{
    return response.json();
  }
}) // parse the JSON from the server
  .then(data => {
    if(data.success){
      callback(data.data);
    }
    else{
      console.log('Failure to get names');
    }
  });
}

function renameCapture(id, newName, update){
  var data = {
    id,
    newName
  }
  fetch('/rename',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  }).then(result =>{
    if(!result.ok){
      console.log("Failed to get response from server");
    }
    else{
      return result.json()
    }
  }).then(data =>{
    if(data.success){
      console.log("Rename successful");
      update();
    }
    else{
      console.log("Failed to rename Capture")
    }
  }).catch(err=>{
    console.log('Rename Error:' + err);
  })
}

function deleteCapture(id, update){
  var data = {
    id
  }
  fetch('/delete',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  }).then(result =>{
    if(!result.ok){
      console.log("Failed to get response from server");
    }
    else{
      return result.json()
    }
  }).then(data =>{
    if(data.success){
      console.log("Delete successful");
      update();
    }
    else{
      console.log("Failed to delete Capture: " + data.errorText);
    }
  }).catch(err=>{
    console.log('Delete Error:' + err);
  })
}

export default {getCaptureNames, getCapture, renameCapture, deleteCapture}