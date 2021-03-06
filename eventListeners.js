function EventListeners(eventEmitter){
    this.eventEmitter = eventEmitter;
}

EventListeners.prototype = {
    
    register: function(){
        var eventEmitter = this.eventEmitter;
        
        eventEmitter.on('user.refresh', function(io, req, res, next){
            
        });
        
        eventEmitter.on('user.message', function(io, req, res, next){
            io.sockets.clients().every(function(socket){
                console.log(socket.handshakeData);
            });
            
            next();
        });
    }
    
}

module.exports = function(eventEmitter){
    return new EventListeners(eventEmitter);
}