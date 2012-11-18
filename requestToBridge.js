function RequestToBridge(request, queryString){
    this.request = request;
    this.queryString = queryString;
    this.logger = require('nogg').logger('requestToBridge');
};

RequestToBridge.prototype = {

    setIo: function(io){
        this.io = io;
    },

    /**
     * @param socket
     * @param eventName
     * @param eventParameters
     * @param cb
     */
    execute: function(socket, eventName, eventParameters, cb){
        if(typeof eventParameters != "object"){
            eventParameters = {};
        }

        var body = this.getBody(socket, [{
            name: eventName,
            parameters: eventParameters
        }]);

        var cbs = {};
        if(typeof cb == "function"){
            cbs[eventName] = cb;
        }

        this.logger.debug(eventName);

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
        var self = this;
        this.request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            uri: uri,
            body: body
        }, function(err, response, body){
            self.logger.debug(body);
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
     * @param isDisconnecting
     * @return {*}
     */
    getBody: function(socket, events, isDisconnecting){
        if(typeof isDisconnecting == undefined){
            isDisconnecting = false;
        }

        var users = {};
        this.io.of('/'+socket.handshake.apiName).clients().forEach(function(roomSocket){
            if(isDisconnecting == true && roomSocket.id == socket.id){
                return;
            }

            var identification = roomSocket.handshake.identification;
            if(!users[identification]){
                users[identification] = [];
            }
            users[identification].push(roomSocket.id);
        });

        return this.queryString.stringify({
            socketId: socket.id,
            identification: socket.handshake.identification,
            users: JSON.stringify(users),
            events: JSON.stringify(events)
        });
    }
  
};

module.exports = function(request, queryString){
    return new RequestToBridge(request, queryString);
}