function SocketEvents(requestToBridge){
    this.requestToBridge = requestToBridge;
    this.logger = require('nogg').logger('socketEvents');
};

SocketEvents.prototype = {

    register: function(socket){
        var self = this;
        var requestToBridge = this.requestToBridge;

        requestToBridge.execute(socket, 'user.connection', {}, function(err, result){
            if(err){
                self.logger.warn('bridge on event user.connection error');
                self.logger.warn(err);
                return;
            }
        });

        socket.on('message', function(eventName, args, cb){
            if(typeof eventName != "string"){
                self.logger.warn('message without eventName received');

                if(typeof cb == "function"){
                    cb('need eventName');
                }
                return;
            }

            if(typeof args != "object"){
                args = {};
            }

            requestToBridge.execute(socket, eventName, args, function(err, result){
                if(err){
                    self.logger.warn('bridge on event message error');
                    self.logger.warn(err);
                }

                if(typeof cb == "function"){
                    cb(err, result);
                }
            });
        });

        socket.on('disconnect', function(){
            requestToBridge.execute(socket, 'user.disconnection', {}, function(err, result){
                if(err){
                    self.logger.warn('bridge on event user.disconnection error');
                    self.logger.warn(err);
                    return;
                }
            });
        });
    }
    
};

module.exports = function(requestToBridge){
    return new SocketEvents(requestToBridge);
};