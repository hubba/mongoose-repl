Mongoose Repl
=============

This is a REPL (read-eval-print-loop) for mongoose. 

Requirements
============

> Node 7.5

This project relies on async await to provide a good experience, please ensure
that you have a compatible version of NodeJs.


Integration
===========

To add to project:

`npm install --save-dev @hubba/hubba-repl`


To use:
```javascript
const repl = require('@hubba/hubba-repl');

// Initialize the mongoose connection
mongoose.connect( config.mongo.uri, config.mongo.options );

// initialize the repl
repl({
    dirname: path.join(__dirname, '../server/'),
    mongoose
});

```

The repl can be initialized with the path of the directory to walk through to find models.

The default model files that will be loaded are: 
```modelFileRegex``` The regular expression deciding which files are to be loaded.

Once the files are loaded by node, they will be checked if they export a specific 
interface.

The model files must export mongoose models as their root export. EX:

```node
module.exports = mongoose.model('User', UserSchema);
```

Once integrated the repl provides some a command:

`.models`
--------

List all the models that have been loaded.

```bash
    node repl.js
    > .models
    [ 
    'UserMetadata',
    'User',
    'SchemaVersion' ]
```

This will list all of your models that have been loaded and are available in the global
scope.

This will also list all the paths of a model if a model is specified.

```bash
    node repl.js
    > .models User
    name : String - 
    status : String - draft,published
    updatedAt : Date  
    createdAt : Date  
    deleted : Boolean  
    deletedAt : Date 
```

The first element in the list is the model property. The second property after the colon is the type. If there is a dash then the following properties are available enum values.


Finding
-------

To find a model -- for the sake of example lets use User -- you may use a variety of commands:

```bash
    node repl.js
    > User.find({})
    [{ _id: 597ba6811a651e6be35fe859,
    n: 'Blahblah User'}]
    > User.findById('597ba6811a651e6be35fe859')
    { _id: 597ba6811a651e6be35fe859,
    n: 'Blahblah User'} 
    > User.findOne({_id: ObjectId('597ba6811a651e6be35fe859')})
    { _id: 597ba6811a651e6be35fe859,
    n: 'Blahblah User'} 
```

ObjectId
--------

`ObjectId` Method will automatically create a mongoose object id, the idea behind this
is for those people who want to use a syntax similiar to the mongodb REPL have the ability.

Creating
--------

To create a model you can use `User.create`. The model will run all pre and post hooks
as well as any validations.

If your model is initialized with the `isWritable` attribute false, then create will 
throw an exception when called.

```bash
    node repl.js
    > User.create({n: 'Test User'})
    { _id: 597ba6811a651e6be35fe859,
    n: 'Test User'}
```

Set Where
---------

If you would like to do a multi document update then you can use the `User.setWhere(query, values)` command.
















