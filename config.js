module.exports = {
    socket: {
        port: 8080
    },

    api: {
        tokens: {
            demo: {
                client: 'client',
                server: 'server',
                bridgeUri: 'http://node.local/app_dev.php/bridge/call',
                eventNamePrefix: 'mikemeier_php_node_bridge'
            }
        }
    }
};