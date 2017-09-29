const repl = require('repl');
const fs = require('fs');
const history = require('repl.history');
const rewrite = require('./rewrite');
const os = require('os');
const path = require('path');
const historyFile = path.join(os.homedir(), '.async_repl_history');
const net = require('net');
const util = require('util');
const readAllModels = require('./mongooseLoader');
const replClient = require('./replClient');

function eval(mongoose, originalEval) {
    return function awaitingEval(cmd, context, filename, callback) {
        try {
            cmd = rewrite(cmd);
        } catch (err) {
            callback(err);
        }

        originalEval.call(this, cmd, context, filename, async function(err,value) {
            if (err) {
                callback.call(this, err, null);
            } else {
                try {   
                    value = await value;
                    callback.call(this, err, value);
                } catch (error) {
                    if (error instanceof mongoose.Error) {
                        console.dir(error, false, null);
                    }

                    callback.call(this, error, null);
                }
            }
        });
    }
}

function modelsCommand(models, writeFcn) {
    return function(model) {
        if (!model || !model.length ) {
            writeFcn(Object.keys(models));
            this.displayPrompt();
        } else {
            const modelFound = models[model];

            if (typeof modelFound === 'undefined') {
                writeFcn(`No model found ${model}`);
                this.displayPrompt();
                return;
            }

            const paths = modelFound.model.schema.paths;

            Object.keys(paths).map(function(path) {
                const currentPath = paths[path];
                writeFcn(`${currentPath.path} : ${currentPath.instance} ${ currentPath.enumValues ? `- ${currentPath.enumValues}` : ''} `);
            });
            
            this.displayPrompt();
        }
    }
}

function load({
    modelFileRegex = /\.model\.js$/,
    dirname,
    socketPort,
    replServer,
    mongoose
} = {}) {
    const models = readAllModels(module, dirname, modelFileRegex, mongoose);

    function beginSession(socket) {
        const options = { 
            prompt: '> ',
            useColors: true,
            terminal: true
        };

        function writeFcn (...args) {
            if (socket) {
                socket.write(`${util.format.apply(null, args)}\n`);
            } else {
                console.log.apply(console, args);
            }
        }

        if (socket) {
            Object.assign(options,{
                input: socket,
                output: socket
            });
        }

        const replServer = repl.start(options);
        replServer.eval = eval(mongoose, replServer.eval);
        Object.assign(replServer.context, models);
    
        history(replServer, historyFile);
        replServer.context.ObjectId = function(string) { return new mongoose.Types.ObjectId(string) };
        
        replServer.defineCommand('models',{ 
            action: modelsCommand(models, writeFcn),
            help: 'List all models or find model properties'
        });

        replServer.on('exit', () => {
            console.log('Exiting mongoose REPL...');
            if (!socket) {
                process.exit();
            } else {
                socket.destroy();
            }
        });
    }
    
    /**
     * The Repl can be set up 3 ways:
     * 
     * Client - will pipe all data to the server and pipe responses to STDOUT.
     * Server - will read all data from the client and respond.
     * Local - will output and read from local environment.
     */
    if (socketPort) {
        net.createServer((socket) => {
            console.log('Got Connection!');
            beginSession(socket);
        }).listen(socketPort);
    } else if (replServer) {
        replClient(replServer);
    } else {
        beginSession();
    }
};

module.exports = load;
