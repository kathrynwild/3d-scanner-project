var scale = .001;

function getDecodedDataFromImage(image, zmin, zmax, numStairs){
  var cvs = document.createElement('canvas');
  cvs.width = image.width;
  cvs.height = image.height;
  var ctx = cvs.getContext('2d');
  ctx.drawImage(image,0,0,cvs.width,cvs.height);
  var idt = ctx.getImageData(0,0,cvs.width,cvs.height);
  
  var depthLength = image.width*image.height*2;
  var byteRunner = 0;
  var vertices = [];
  var colorData = []
  var zrng = zmax-zmin;
  var zcen = zmin + zrng/2.0;  
  var stepHeight = zrng/numStairs;
  console.log(numStairs);
  
  var u0 = 314.5;
  var v0 = 235.5;
  var fu = 570.3422241210938;
  var fv = 570.3422241210938;
  
  var count = 0;
  
  for(var y = 0; y<image.height/2; y++){
    for(var x = 0; x<image.width; x++){
      var cr = idt.data[byteRunner + depthLength]/255.0;
      var dr = idt.data[byteRunner++]/255.0;
      var cg = idt.data[byteRunner + depthLength]/255.0;
      var dg = idt.data[byteRunner++]/255.0;
      var cb = idt.data[byteRunner + depthLength]/255.0;
      var db = idt.data[byteRunner++]/255.0;
      byteRunner++
      
      var z=0;
      if(dr + dg + db > .1){
        var phi2 = db * Math.PI*2 - Math.PI;
        var phi1 = Math.atan2(dr-.5,dg-.5);
        var k = (phi2 * zrng / stepHeight - phi1) / Math.PI / 2;
        var phe = phi1 + Math.round(k) * Math.PI * 2;
        z = (phe * stepHeight / Math.PI / 2 + zcen)*scale;
         var u = z * (x - u0) / fu;
        var v = z * (y-v0) / fv;
      

      colorData.push(cr, cg, cb);
      vertices.push(u, -v,zcen*scale-z);    
        //z = db;
      }
       
    }
  }
  return{
    colorData: colorData,
    vertices: vertices
  }
}

export default {getDecodedDataFromImage}