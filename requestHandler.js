function RequestHandler(eventEmitter, tokens, bodyParser){
    this.eventEmitter = eventEmitter;
    this.tokens = tokens;
    this.bodyParser = bodyParser;
    this.io = null;
};

RequestHandler.prototype = {
    
    setIo: function(io){
        this.io = io;
    },
    
    getIo: function(){
        return this.io;
    },
    
    mergeRecursive: function(obj1, obj2){
        for(var p in obj2){
            try{
                if(obj2[p].constructor==Object){
                    obj1[p] = this.mergeRecursive(obj1[p], obj2[p]);
                }else{
                    obj1[p] = obj2[p];
                }
            }catch(e){
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    },
    
    getHandler: function(){
        
        var self = this;
        
        var eventEmitter = this.eventEmitter;
        var tokens = this.tokens;
        var bodyParser = this.bodyParser;
        var mergeRecursive = this.mergeRecursive;
        
        return function(req, res){
            var io = self.getIo();
            
            bodyParser()(req, res, function(){
                res.writeHead(200, [["Content-Type", "text/json"]]);
                
                if(!req.body){
                    res.write(JSON.stringify({error: 'no data given'}));
                    res.end();
                    return;
                }
                
                if(!req.body.name || !req.body.token){
                    res.write(JSON.stringify({error: 'parameters invalid'}));
                    res.end();
                    return;
                }
                
                if(!tokens[req.body.name] || tokens[req.body.name]['server'] != req.body.token){
                    res.write(JSON.stringify({error: 'access denied'}));
                    res.end();
                    return;
                }

                console.log(req.body.name);
                console.log(req.body);
                
                var eventName = req.body.eventName;
                if(!eventName){
                    res.write(JSON.stringify({error: 'no eventName given'}));
                    res.end();
                    return;
                }else{
                    var eventEmitterEventName = 'bridge.request.'+ eventName;
                    var eventListenersLength = eventEmitter.listeners(eventEmitterEventName).length;
                    
                    if(eventListenersLength == 0){
                        res.write(JSON.stringify({error: 'no eventListeners registered for '+ eventEmitterEventName}));
                        res.end();
                        return;
                    }
                    
                    var receivedResults = 0;
                    var resData = {};
                    
                    eventEmitter.emit(eventEmitterEventName, io, req, res, function(err, data){
                        if(err){
                            res.write(JSON.stringify({error: err}));
                            res.end();
                            return;
                        }
                        
                        if(data){
                            mergeRecursive(resData, data);
                        }
                        
                        receivedResults++;
                        if(receivedResults == eventListenersLength){
                            res.write(JSON.stringify(resData));
                            res.end();
                        }
                    });
                }
            });
        };
        
    }
    
};

module.exports = function(eventEmitter, tokens, bodyParser){
    return new RequestHandler(eventEmitter, tokens, bodyParser);
}