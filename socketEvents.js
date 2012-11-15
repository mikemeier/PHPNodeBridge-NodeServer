function SocketEvents(requestToBridge){
    this.requestToBridge = requestToBridge;
};

SocketEvents.prototype = {
    
    register: function(socket, eventNamePrefix){
        console.log('reqgister '+eventNamePrefix);

        var requestToBridge = this.requestToBridge;

        requestToBridge.execute(socket, eventNamePrefix+'.user.connection', {}, function(err, result){
            console.log(result);
        });

        socket.on(eventNamePrefix+'.user.message', function(){
            var args = [];
            for(i in arguments){
                args.push(arguments[i]);
            }

            var popedArgs = args.slice(0);
            var cb = popedArgs.pop();

            if(typeof(cb) == "function"){
                args = popedArgs;
            }else{
                cb = null;
            }

            requestToBridge.execute(socket, eventNamePrefix+'.user.message', args, cb);
        });

        socket.on('disconnect', function(){
            requestToBridge.execute(socket, eventNamePrefix+'.user.disconnection', {}, function(err, result){
                console.log(result);
            });
        });
    }
    
};

module.exports = function(requestToBridge){
    return new SocketEvents(requestToBridge);
};