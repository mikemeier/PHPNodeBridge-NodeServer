function SocketEvents(requestToBridge){
    this.requestToBridge = requestToBridge;
};

SocketEvents.prototype = {
    
    register: function(socket){
        var requestToBridge = this.requestToBridge;

        requestToBridge.execute(socket, 'user.connection', {}, function(err, result){
            console.log(result);
        });

        socket.on('user.message', function(){
            console.log('got message');

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

            console.log(args);
            console.log(cb);

            requestToBridge.execute(socket, 'user.message', args, cb);
        });

        socket.on('disconnect', function(){
            requestToBridge.execute(socket, 'user.disconnection', {}, function(err, result){
                console.log(result);
            });
        });
    }
    
};

module.exports = function(requestToBridge){
    return new SocketEvents(requestToBridge);
};