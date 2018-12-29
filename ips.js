"use strict"
const debug = require("debug");
const mongoIpsModel = require("./models/mongo_ip");
const cluster = require('cluster');
const async = require("async");

const mongoClient = require("mongodb").MongoClient;
const numCPUs = require('os').cpus().length;
const numberOfSystems = 8;


function start( ranges, counts) {

    if( ranges.start == null || ranges.end == null){
    console.log("system number", process.argv[2])
    let system = Number(process.argv[2]);
    if (!Number.isInteger(system)) {
        throw new Error(" system number must be integer");
    }
    if (system <= 0 || system > numberOfSystems) {
        throw new Error("System out of range");
    }
      ranges.start = 0,
        ranges.end = 256/ numberOfSystems;
    ranges.end = ranges.end * system;
    ranges.start = ranges.end - 256 / numberOfSystems;
    ranges.start = 1;
}
    console.log("ranges ", ranges);
  //  generateIp(start, end);
    findIps( ranges, counts);
}


 function findIps( ranges, counts){

    let start = ranges.start, end = ranges.end;
    var networks = []
    var parts2 = []
    for( let i = start; i < end; i++)
        networks.push(i);
    for( let i = 0; i < 256; i++ )
        parts2.push(i);
    var parts3 = []
    for( let i = 38; i < 256; i++ )
        parts3.push(i);
    var parts4 = []
    for( let i = 0; i < 256; i++ )
        parts4.push(i);
    console.log( networks)
    process.on("exit", function(){
    	console.log("fail:", counts.fail, "suc:", counts.suc);
    })
    //console.log( counts )
    async.eachSeries( networks, function( network1, cb1){

        async.eachSeries( parts2, function( network2, cb2){

            async.eachSeries( parts3, function(host1, cb3){

                async.each( parts4, function( host2, cb4){                    
                    connect(network1, network2, host1, host2, counts, function(){

                       // console.log(network1, network2, host1, host2, "fail:", counts.fail, "suc:", counts.suc);
                        cb4()
                    });
                
                }, function(err){
                    console.log(network1, network2, host1, "fail:", counts.fail, "suc:", counts.suc);
                	setTimeout( () => { 
                    cb3(err);
                    }, 0);
                })

            }, function(err){
                
                global.gc();
               // cb2(err);
                setTimeout( () => {
               		console.log(network1, network2, "fail:", counts.fail, "suc:", counts.suc);
                	cb2(err)
                }, 5000);
            })

        }, function( err){
                ranges.start++;
                cb1(err);
        })

    }, function(err){
        
        console.log("completed");
        process.exit();
    }); 

}

async function generateIp(start, end) {
    var counts = {
        fail: 0,
        suc: 0
    };
    var totalCalls = 0;

    async function helper(network1, network2, host1) {


        for (let host2 = 0; host2 < 256; host2++) {

           await connect(network1, network2, host1, host2,  function (){
                console.log(network1, network2, host1, host2);
            });


        }
    }
    for (let network1 = start; network1 < end; network1++) {
        for (let network2 = 0; network2 < 256; network2++) {

            //  setTimeout(() => {
            for (let host1 = 0; host1 < 256; host1++) {
                await helper(network1, network2, host1);         
            }
            global.gc();
        }

      //  console.log(network1, network2, "fail:", counts.fail, "success:", counts.suc);
        //}, 2000);
        setTimeout(() => {}, 5000);
    }

}

function connect(network1, network2, host1, host2, counts, callback) {

    mongoClient.connect("mongodb://" + network1 + "." + network2 + "." + host1 + "." + host2 + ":27017", function (err, db) {

        if (err) {
            // don't do anything. we can't handle 4.2 billion errors
            //console.log(new Error(err));
            callback()
            err = null;
            counts.fail ++;
           
        } else { /**Voila Db. connected */
            let openIp = network1 + "." + network2 + "." + host1 + "." + host2;
            counts.suc++;
            saveIp(openIp, callback);
            db.close();
            //delete db;
        }
    });

}

function saveIp(openIp, callback) {
    let doc = {
        ip: openIp,
        date: Date.now()
    }
    doc = new mongoIpsModel(doc);
    doc.save(function (err, res) {
        if (err) {
            console.log(new Error(err));
        }
        callback();
    });

}


module.exports = {
    start
}
