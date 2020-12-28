var MongoClient=require('mongodb').MongoClient;
var state={
    db:null,
};
module.exports.connect=function(done){
    if(state.db)return done();

    const url='mongodb://localhost:27017';

    const dbName='code';
    const client=new MongoClient(url,{useNewUrlParser:true,useUnifiedTopology:true});

    client.connect(function (err) {

        if(err) return done(err);
        console.log("connected successfully to the Database");
        const dbs=client.db(dbName)
        state.db=dbs;
        done();


    });
};
module.exports.get=function () {
    return state.db;
};