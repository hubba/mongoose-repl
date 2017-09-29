const AsyncMongoose = require('./asyncMongoose');
const requireDirectory = require('require-directory');


const readAllModels = function(requireResult, modelFileRegex, mongoose) {
    let models = {};

    for (i in requireResult) {
        if (modelFileRegex.test(i)) {
            if (requireResult[i] instanceof mongoose.Model.constructor) {
                models[requireResult[i].modelName] = new AsyncMongoose(requireResult[i]);
            }
        } else {
            const possibleModel = requireResult[i];
            
            if (Object.keys(possibleModel).length >= 0) {
                const subDirModels = readAllModels(possibleModel, modelFileRegex, mongoose);
                Object.assign(models, subDirModels);
            }
        }
    }

    return models;
};

const load = function(loadingModule, dirname,  modelFileRegex, mongoose) {
    const requireResults = requireDirectory(module, dirname, {
        include: modelFileRegex,
        rename: function(name, path, filename) {
            if (modelFileRegex.test(filename)) {
                return filename;
            } else {
                return name;
            }
        },
    });

    return readAllModels(requireResults, modelFileRegex, mongoose);
}

module.exports = load;
