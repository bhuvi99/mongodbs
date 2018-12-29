'use strict'
const mongoose = require('mongoose');
const config = require("config");
const ip = require("./ips");
const EventEmitter = require('events').EventEmitter;

const bruteForce = new EventEmitter();
bruteForce.on("start", ip.start)
//  bruteForce.on("start", function(){
//      console.log("started");
//  })


process.on( "message", function( message){

    message = JSON.parse( JSON.stringify(message));
    if( message.type === "range") {
        console.log(process.pid);
        console.log( message.start, message.end );

        startPoint(message.start, message.end );
    }
      
  //  

})

function startPoint( start, end) {

    var ranges = {
        start: start,
        end: end
    }
    var counts = {
        fail: 0,
        suc: 0
    };

    const options = {
        auto_reconnect: true,
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 1000, // Maintain up to 1000 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
        keepAlive: 120,
        promiseLibrary: require('bluebird'),
        useNewUrlParser: true
    };
    if (process.env.NODE_ENV != 'development' && process.env.NODE_ENV != undefined) {
        // console.log("process.env.NODE_ENV",process.env.NODE_ENV);
        // mongoose.set('debug', true);
    } else {
        //mongoose.set('debug', true);
    }
    mongoose.connect(config.mongodb.uri, options)
        .then(() => {console.log('connection successful')})
        .catch((err) => console.error(err));

    const db = mongoose.connection;
    db.once('error', function (err) {
        console.error('mongoose connection error' + err);
        mongoose.disconnect();
    });
    db.on('open', function () {
        bruteForce.emit("start", ranges, counts)
        console.log('mongoDB connected', process.pid);
    });
    db.on('reconnected', function () {
        bruteForce.emit("start", ranges, counts)
        console.log('mongoDB reconnected');
    });
    db.on('disconnected', function () {
        console.log('mongoDB disconnected');
        if (!process.exit) {
            mongoose.connect(config.mongodb.uri, options)
                .then(() => console.log('connection successful'))
                .catch((err) => console.error(err));
        }
    });
    process.on('SIGINT', function () {
        console.log(' on exit called by node');
        //  processexit = true;
        mongoose.connection.close()
        process.exit();
    });

}