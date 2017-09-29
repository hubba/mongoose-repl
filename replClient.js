const net = require('net');

module.exports = function(replServer) {
    const replConnection = net.connect(replServer.port, replServer.host);
    replConnection.on('connect', function() {
        process.stdin.setRawMode(true);
    });

    replConnection.on('close', function() {
        process.exit();
    });
    
    process.stdin.pipe(replConnection);
    replConnection.pipe(process.stdout);
    
    process.stdin.on('end', function() {
        process.stdin.setRawMode(false);
        replConnection.destroy();
        console.log('Hangup!');
    });

    process.stdin.on('data', function(b) {
        if(b.length === 1 && b[0] === 4) {
            process.stdin.emit('end');
        }
    });
};