const jpeg = require('jpeg-js');

//texture side by side
function encodeDataHorizontal(depthData, colorData, mapWidth, mapHeight, zmax, zmin, numStairs)
{
  //captureData + 2 integers and a byte(zmin, zmax and numstairs)
    var arrayBuff = new ArrayBuffer(mapHeight*mapWidth*8 + 9);
    var captureData = new Uint8Array(arrayBuff);
    var stepHeight = (zmax - zmin) / numStairs;
    var zcen = zmin + (zmax - zmin) / 2;
    var offset = 4;

    for (var y = 0; y < mapHeight; y++)
    {
        for (var x = 0; x < mapWidth; x++)
        {
            var bufferPixelCount = 2 * y * mapWidth + x;
            var depthPixelCount = (mapHeight - y - 1) * mapWidth + x;
            var depthValue = depthData[depthPixelCount];
            if (depthValue > zmax || depthValue < zmin)//filtering
            {
                captureData[4 * bufferPixelCount + offset] = 0;
                captureData[4 * bufferPixelCount + offset + 1] = 0;
                captureData[4 * bufferPixelCount + offset + 2] = 0;
                captureData[4 * bufferPixelCount + offset + 3] = 0;

                bufferPixelCount = (2 * y + 1) * mapWidth + x;
                captureData[4 * bufferPixelCount + offset] = 0;
                captureData[4 * bufferPixelCount + offset + 1] = 0;
                captureData[4 * bufferPixelCount + offset + 2] = 0;
                captureData[4 * bufferPixelCount + offset + 3] = 0;
            }
            else
            {
                var normalizedDepthValue = ((depthValue) - zmin) / (zmax - zmin);
                var zz = (zcen - (depthValue)) / stepHeight;

                captureData[4 * bufferPixelCount + offset] = Math.floor((0.5 + 0.5 * Math.sin(Math.PI * 2 * zz)) * 255);
                captureData[4 * bufferPixelCount + offset + 1] = Math.floor((0.5 + 0.5 * Math.cos(Math.PI * 2 * zz)) * 255);
                captureData[4 * bufferPixelCount + offset + 2] = Math.floor((normalizedDepthValue) * 255);
                captureData[4 * bufferPixelCount + offset + 3] = 255;
              
                bufferPixelCount = (2 * y + 1) * mapWidth + x;
                captureData[4 * bufferPixelCount + offset] = colorData[depthPixelCount].R;
                captureData[4 * bufferPixelCount + offset + 1] = colorData[depthPixelCount].G;
                captureData[4 * bufferPixelCount + offset + 2] = colorData[depthPixelCount].B;
                captureData[4 * bufferPixelCount + offset + 3] = colorData[depthPixelCount].A;
            }

        }
    }
    addInt16ToByteArray(zmax, captureData, mapWidth*mapHeight*8 + offset); //append zmax
    addInt16ToByteArray(zmin, captureData, mapWidth*mapHeight*8 + +offset +2); // append zmin
    captureData[mapWidth*mapHeight*8 + offset + 4] = numStairs;
    captureData[0] = mapWidth & (255);
    captureData[1] = mapWidth >> 8 &(255);
    captureData[2] = mapHeight & (255);
    captureData[3] = mapHeight >> 8 &(255);
    return captureData;
}
//textures on top of each other
function encodeDataVertical(depthData, colorData, mapWidth, mapHeight, zmax, zmin, numStairs)
{
  /*
  //captureData + 2 integers and a byte(zmin, zmax and numstairs)
    var arrayBuff = new ArrayBuffer(mapHeight*mapWidth*8 + 9);
    var captureData = new Uint8Array(arrayBuff);
    var stepHeight = (zmax - zmin) / numStairs;
    var zcen = zmin + (zmax - zmin) / 2;
    var offset = 4;

    for (var y = 0; y < mapHeight; y++)
    {
        for (var x = 0; x < mapWidth; x++)
        {
            var bufferPixelCount = y * mapWidth + x;
            var depthPixelCount = (mapHeight - y - 1) * mapWidth + x;
            var depthValue = depthData[depthPixelCount];
            if (depthValue > zmax || depthValue < zmin)//filtering
            {
                captureData[4 * bufferPixelCount + offset] = 0;
                captureData[4 * bufferPixelCount + offset + 1] = 0;
                captureData[4 * bufferPixelCount + offset + 2] = 0;
                captureData[4 * bufferPixelCount + offset + 3] = 0;

                bufferPixelCount = (y + mapHeight) * mapWidth + x;
                captureData[4 * bufferPixelCount + offset] = 0;
                captureData[4 * bufferPixelCount + offset + 1] = 0;
                captureData[4 * bufferPixelCount + offset + 2] = 0;
                captureData[4 * bufferPixelCount + offset + 3] = 0;
            }
            else
            {
                var normalizedDepthValue = ((depthValue) - zmin) / (zmax - zmin);
                var zz = (zcen - (depthValue)) / stepHeight;

                captureData[4 * bufferPixelCount + offset] = Math.floor((0.5 + 0.5 * Math.sin(Math.PI * 2 * zz)) * 255);
                captureData[4 * bufferPixelCount + offset + 1] = Math.floor((0.5 + 0.5 * Math.cos(Math.PI * 2 * zz)) * 255);
                captureData[4 * bufferPixelCount + offset + 2] = Math.floor((normalizedDepthValue) * 255);
                captureData[4 * bufferPixelCount + offset + 3] = 255;
              
                bufferPixelCount = (y+mapHeight) * mapWidth + x;
                captureData[4 * bufferPixelCount + offset] = colorData[depthPixelCount].R;
                captureData[4 * bufferPixelCount + offset + 1] = colorData[depthPixelCount].G;
                captureData[4 * bufferPixelCount + offset + 2] = colorData[depthPixelCount].B;
                captureData[4 * bufferPixelCount + offset + 3] = colorData[depthPixelCount].A;
            }

        }
    }
    addInt16ToByteArray(zmax, captureData, mapWidth*mapHeight*8 + offset); //append zmax
    addInt16ToByteArray(zmin, captureData, mapWidth*mapHeight*8 + offset + 2); // append zmin
    captureData[mapWidth*mapHeight*8 + offset + 4] = numStairs;
    captureData[0] = mapWidth & (255);
    captureData[1] = mapWidth >> 8 &(255);
    captureData[2] = mapHeight & (255);
    captureData[3] = mapHeight >> 8 &(255);
    return captureData;*/
    
    var numDataBytes = mapWidth*mapHeight*6;
    var arrayBuff = new ArrayBuffer(numDataBytes + 9);
    var captureData = new Uint8Array(arrayBuff);
    var stepHeight = (zmax - zmin) / numStairs;
    var zcen = zmin + (zmax - zmin) / 2;
    var offset = 4; 

    for (var y = 0; y < mapHeight; y++)
    {
        for (var x = 0; x < mapWidth; x++)
        {
            var bufferPixelCount = y * mapWidth + x;
            var depthPixelCount = (mapHeight - y - 1) * mapWidth + x;
            var depthValue = depthData[depthPixelCount];
            if (depthValue > zmax || depthValue < zmin)//filtering
            {
                captureData[3 * bufferPixelCount + offset] = 0;
                captureData[3 * bufferPixelCount + offset + 1] = 0;
                captureData[3 * bufferPixelCount + offset + 2] = 0;

                bufferPixelCount = (y + mapHeight) * mapWidth + x;
                captureData[3 * bufferPixelCount + offset] = 0;
                captureData[3 * bufferPixelCount + offset + 1] = 0;
                captureData[3 * bufferPixelCount + offset + 2] = 0;
            }
            else
            {
                var normalizedDepthValue = ((depthValue) - zmin) / (zmax - zmin);
                var zz = (zcen - (depthValue)) / stepHeight;

                captureData[3 * bufferPixelCount + offset] = Math.floor((0.5 + 0.5 * Math.sin(Math.PI * 2 * zz)) * 255);
                captureData[3 * bufferPixelCount + offset + 1] = Math.floor((0.5 + 0.5 * Math.cos(Math.PI * 2 * zz)) * 255);
                captureData[3 * bufferPixelCount + offset + 2] = Math.floor((normalizedDepthValue) * 255);
              
                bufferPixelCount = (y+mapHeight) * mapWidth + x;
                captureData[3 * bufferPixelCount + offset] = colorData[depthPixelCount].R;
                captureData[3 * bufferPixelCount + offset + 1] = colorData[depthPixelCount].G;
                captureData[3 * bufferPixelCount + offset + 2] = colorData[depthPixelCount].B;
            }

        }
    }
    addInt16ToByteArray(zmax, captureData, numDataBytes + offset); //append zmax
    addInt16ToByteArray(zmin, captureData, numDataBytes + offset + 2); // append zmin
    captureData[numDataBytes + offset + 4] = numStairs;
    captureData[0] = mapWidth & (255);
    captureData[1] = mapWidth >> 8 &(255);
    captureData[2] = mapHeight & (255);
    captureData[3] = mapHeight >> 8 &(255);
    return captureData;
}
function generatePlane(depth, mapWidth, mapHeight)
{
    var depthData = [];
    for (var y = 0; y <mapHeight; y++)
    {
        for (var x = 0; x < mapWidth; x++)
        {
            depthData[y*mapWidth + x] = depth;
        }
    }
    return depthData;
}
function fillColor(color, mapWidth, mapHeight)
{
    var colorData = [];
    for (var y = 0; y < mapHeight; y++)
    {
        for (var x = 0; x < mapWidth; x++)
        {
            colorData[y * mapWidth + x] = color;
        }
    }
    return colorData;
}
function addInt16ToByteArray(int, array, startIndex){
  var i=2;
  do{
    array[startIndex + 2 - i--] = int & (255);
    int = int >> 8;
  }while(i)
}

function encodeDataIntoJPEG(depthData, colorData, mapWidth, mapHeight, zmax, zmin, numStairs){
    var numImageBytes = mapWidth*mapHeight*4;
    var numDataBytes = numImageBytes*2;
    var captureData = new Buffer.alloc(numDataBytes);
    var stepHeight = (zmax - zmin) / numStairs;
    var zcen = zmin + (zmax - zmin) / 2; 

    for (var y = 0; y < mapHeight; y++)
    {
        for (var x = 0; x < mapWidth; x++)
        {
            var bufferPixelCount = y * mapWidth + x;
            var depthValue = depthData[bufferPixelCount];
          
            if (depthValue > zmax || depthValue < zmin)//filtering
            {
                captureData[4 * bufferPixelCount] = 0;
                captureData[4 * bufferPixelCount + 1] = 0;
                captureData[4 * bufferPixelCount + 2] = 0;
                captureData[4 * bufferPixelCount + 3] = 0;
  
                captureData[4 * bufferPixelCount + numImageBytes] = 0;
                captureData[4 * bufferPixelCount + numImageBytes + 1] = 0;
                captureData[4 * bufferPixelCount + numImageBytes + 2] = 0;
                captureData[4 * bufferPixelCount + numImageBytes + 3] = 0;
            }
            else
            {
                var normalizedDepthValue = ((depthValue) - zmin) / (zmax - zmin);
                var zz = (zcen - (depthValue)) / stepHeight;

                captureData[4 * bufferPixelCount] = Math.floor((0.5 + 0.5 * Math.sin(Math.PI * 2 * zz)) * 255);
                captureData[4 * bufferPixelCount + 1] = Math.floor((0.5 + 0.5 * Math.cos(Math.PI * 2 * zz)) * 255);
                captureData[4 * bufferPixelCount + 2] = Math.floor((normalizedDepthValue) * 255);
                captureData[4 * bufferPixelCount + 2] = 0;
              
                captureData[4 * bufferPixelCount + numImageBytes] = colorData[bufferPixelCount].R;
                captureData[4 * bufferPixelCount + numImageBytes + 1] = colorData[bufferPixelCount].G;
                captureData[4 * bufferPixelCount + numImageBytes + 2] = colorData[bufferPixelCount].B;
                captureData[4 * bufferPixelCount + numImageBytes + 3] = 0;
            }

        }
    }
    console.log('jpeg');
  return jpeg.encode(captureData, 75);
}

module.exports = {encodeDataHorizontal, encodeDataVertical, generatePlane, fillColor, encodeDataIntoJPEG};