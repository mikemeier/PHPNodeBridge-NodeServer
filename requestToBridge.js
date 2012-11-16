function RequestToBridge(request, queryString){
    this.request = request;
    this.queryString = queryString;
};

RequestToBridge.prototype = {

    /**
     * @param socket
     * @param eventName
     * @param eventParameters
     * @param cb
     */
    execute: function(socket, eventName, eventParameters, cb){
        var body = this.getBody(socket, [{
            name: eventName,
            parameters: eventParameters
        }]);

        var cbs = {};
        cbs[eventName] = cb;

        this.send(socket.handshake.bridgeUri, body, cbs);
    },

    /**
     * @param socket
     * @param events
     * @param cbs
     */
    executeMultiple: function(socket, events, cbs){
        var body = this.getBody(socket, events);

        this.send(socket.handshake.bridgeUri, body, cbs);
    },

    /**
     * @param uri
     * @param body
     * @param cbs
     */
    send: function(uri, body, cbs){
        this.request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            uri: uri,
            body: body
        }, function(err, response, body){
            try{
                var json = JSON.parse(body);
            }catch(e){
                var json = null;
            }

            if(!json || typeof json.events != "object"){
                return;
            }

            for(var eventName in json.events){
                if(cbs[eventName] && typeof cbs[eventName] == "function"){
                    cbs[eventName](null, json.events[eventName]);
                }
            }

            return;
        });
    },

    /**
     * @param socket
     * @param events
     * @return string
     */
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