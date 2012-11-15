function RequestToBridge(request, queryString){
    this.request = request;
    this.queryString = queryString;
};

RequestToBridge.prototype = {

    execute: function(socket, eventName, eventParameters, cb){
        var body = this.getBody(socket, [{
            name: eventName,
            parameters: eventParameters
        }]);

        this.send(socket.handshake.bridgeUri, body, cb);
    },

    executeMultiple: function(socket, events, cb){
        var body = this.getBody(socket, events);

        this.send(socket.handshake.bridgeUri, body, cb);
    },

    send: function(uri, body, cb){
        this.request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            uri: uri,
            body: body
        }, function(err, response, body){
            if(typeof(cb) == "function"){
                cb(err, body);
            }
            return;
        });
    },

    getBody: function(socket, events){
        return this.queryString.stringify({
            socketId: socket.id,
            identification: socket.handshake.identification,
            events: JSON.stringify(events)
        });
    }
  
};

module.exports = function(request, queryString){
    return new RequestToBridge(request, queryString);
}