function RequestToBridge(request, queryString){
    this.request = request;
    this.queryString = queryString;
};

RequestToBridge.prototype = {

    execute: function(socket, eventName, data, cb){
        this.request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            uri: socket.handshake.bridgeUri,
            body: this.queryString.stringify({
                socketId: socket.id,
                identification: socket.handshake.identification,
                event: eventName,
                data: JSON.stringify(data)
            })
        }, function(err, response, body){
            if(typeof(cb) == "function"){
                cb(err, body);
            }
            return;
        });
    }
  
};

module.exports = function(request, queryString){
    return new RequestToBridge(request, queryString);
}