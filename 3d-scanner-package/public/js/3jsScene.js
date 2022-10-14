//import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import * as THREE from '/three/build/three.module.js';
import {TrackballControls} from '/three/examples/jsm/controls/TrackballControls.js';
import requests from './requests.js'

const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera = new THREE.PerspectiveCamera( 70, 2, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("viewerCanvas")});

var pointMaterial = new THREE.PointsMaterial( { vertexColors: true } );
pointMaterial.size = .01;
var pointCloudGeo = new THREE.BufferGeometry();
var points = new THREE.Points(pointCloudGeo, pointMaterial);
scene.add(points);

camera.position.z = 5;

const controls = new TrackballControls( camera, renderer.domElement );
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];

function animate() {
  controls.update();
  
  resizeCanvasToDisplaySize();
  
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

//getCaptureNames();

//getCapture('capture1', setPointCloud);

function setPointCloud(vertices, colors){
  pointCloudGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  pointCloudGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  pointCloudGeo.computeBoundingSphere();
  
}

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // adjust displayBuffer size to match
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // update any render target sizes here
  }
}



//MENU CODE

var menu = document.getElementById("menuList");
var menuItems = [];

function createMenuItem(capture){
  var div = document.createElement("div");
  div.classList.add("menuElement");
  var item = document.createElement("a");
  item.innerHTML = capture.name;
  item.setAttribute('id', capture._id);
  item.addEventListener('click', ()=>{
    requests.getCapture(capture, setPointCloud);
    select(capture._id);
  });
  
  var img = document.createElement("img");
  img.src = '/ICONS/three-dots-icon-8.jpg';
  img.classList.add("optionsICON");
  img.addEventListener("click", optionsClicked);
  div.appendChild(item)
  div.appendChild(img);
  var li = document.createElement("li");
  li.appendChild(div);
  return li;
}

function updateMenuItems(){
  requests.getCaptureNames(checkMenuItems);
}
updateMenuItems();

function checkMenuItems(items){
  var change = false;
  if(menuItems.length === items.length){
    for(var i=0; i<menuItems.length; i++){
      if(menuItems[i].name != items[i].name){
        change = true;
        break;
      }
    }
  }
  else{
    change = true;
  }
  if(change){
    menuItems = items;
    var children = [];
    for(var i=0; i<menuItems.length; i++){
      children.push(createMenuItem(menuItems[i]));
    }
    while(menu.firstChild){
      menu.removeChild(menu.firstChild);
    }
    
    children.forEach(child => menu.appendChild(child));
  }
}

function optionsClicked(event){
  var modal = document.createElement("div");
  var overlay = document.createElement("div");
  modal.classList.add("modal");
  overlay.classList.add("overlay");
  
  var im = event.target.parentNode.childNodes[0];
  if(!im) return;

  var input = document.createElement("input");
  input.type="text";
  modal.appendChild(input);
  var submit = document.createElement("button");
  submit.innerHTML = "Rename";
  submit.addEventListener('click',() =>{
    requests.renameCapture(im.id, input.value, renameSuccess);
  });
  modal.appendChild(submit);
  var del = document.createElement("button");
  del.innerHTML = "Delete";
  del.addEventListener('click',() =>{
    //requests.renameCapture(im.id, input.value, renameSuccess);
      var response = confirm("Are you sure you want to delete this file?");
      if(response){
        requests.deleteCapture(im.id, renameSuccess)
      }
  });
  modal.appendChild(del);
  modal.style.left = event.clientX  + 'px';
  modal.style.top = event.clientY + 'px';
  document.body.appendChild(modal);
  overlay.addEventListener("click", removeModal);
  document.body.appendChild(overlay);
}

function removeModal(event){
  var removes = ["overlay", "modal"];
  for(var i=0; i<removes.length; i++){
    var elements = document.getElementsByClassName(removes[i]);
    while(elements.length>0){
      elements[0].parentNode.removeChild(elements[0]);
    }
  }  
}

function renameSuccess(){
  removeModal();
  updateMenuItems();
}

function select(id){
  [].slice.call(menu.children).forEach(child => {
    var item = child.children[0].children[0];
    if(item.id==id){
      console.log('selected');
      item.classList.add('selected');
    }
    else{
      item.classList.remove('selected');
    }
  })
}

/*points sizing*/
document.getElementById("pSize-slider").addEventListener('click', (event)=>{
  pointMaterial.size = event.target.value/5000;
})