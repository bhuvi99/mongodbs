'use strict'
const cluster = require( "cluster" );
const nCpu = require("os").cpus().length
cluster.setupMaster({ 
    exec: __dirname + '/mongoips.js'
  })
if( cluster.isMaster){

    let numberOfSystems = 4;
    console.log("system number", process.argv[2])
    let system = Number(process.argv[2]);
    if (!Number.isInteger(system)) {
        throw new Error(" system number must be integer");
    }
    if (system <= 0 || system > numberOfSystems) {
        throw new Error("System out of range");
    }
    let sysStart = 0, sysEnd = 256/numberOfSystems;
    sysEnd = sysEnd * system;
    sysStart = sysEnd - 256/ numberOfSystems;
    
    let processQuant = (sysEnd - sysStart) / nCpu;
    let workers = [];
    for( let i = 0; i < nCpu; i++ ){
       var worker = cluster.fork();
        workers.push( worker );
    }
    let rMessage = {
        type : "range",
       start : 0,
       end : 0
    }
    for( let i = 1; i <= nCpu; i++ ){
        rMessage.start = sysStart + processQuant * (i - 1);
        rMessage.end = sysStart + processQuant * i;
        workers[i-1].send(rMessage);
    }
}