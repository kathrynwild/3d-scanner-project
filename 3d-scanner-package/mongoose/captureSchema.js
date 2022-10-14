const mongoose = require('mongoose')

// creates variable captureSchema to store info in database
const captureSchema = mongoose.Schema({
    name: String,
    url: String,
    zmin: Number,
    zmax: Number,
    numStairs: Number,
    width: Number,
    height: Number
})

// 
module.exports = mongoose.model('captures', captureSchema)