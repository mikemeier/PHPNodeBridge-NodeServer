var eventEmitter2 = require('eventemitter2').EventEmitter2;

var eventEmitter = new eventEmitter2({
    wildcard: true,
    delimiter: '.',
    maxListeners: 20
});

var 
    config = require('./config'),

    request = require('request'),  
    queryString = require('querystring'),
    bodyParser = require('connect-hopeful-body-parser'),
    
    requestHandler = require('./requestHandler')(eventEmitter, config.api.tokens, bodyParser),
    requestToBridge = require('./requestToBridge')(request, queryString);
    
    socketEvents = require('./socketEvents')(requestToBridge),
    eventListeners = require('./eventListeners')(eventEmitter),
    
    server = require('http').createServer(requestHandler.getHandler()),
    io = require('socket.io').listen(server)
;

requestHandler.setIo(io);
requestToBridge.setIo(io);

io.set('authorization', function(handshakeData, cb){
    var query = handshakeData.query;
    
    if(!query.name || !query.token || !query.identification){
        return cb('parameters invalid', false);
    }
    
    var tokens = config.api.tokens;
    if(!tokens[query.name] || tokens[query.name]['client'] != query.token){
        return cb('access denied', false);
    }
    
    var token = tokens[query.name];
    
    handshakeData.bridgeUri = token.bridgeUri;
    handshakeData.identification = query.identification;
    handshakeData.apiName = query.name;
    
    cb(null, true);
});

eventListeners.register();

for(var apiName in config.api.tokens){
    var token = config.api.tokens[apiName];

    // inform bridges about restarting nodejs
    var socketDummy = {id: 'nodejsserver', handshake: {identification: 'nodejsserver', bridgeUri: token.bridgeUri}};
    requestToBridge.execute(socketDummy, 'server.restart');
}

io.on('connection', function(socket){
    socket.join(socket.handshake.apiName);
    socketEvents.register(socket, requestToBridge);
});

server.listen(config.socket.port);