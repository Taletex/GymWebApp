var config = {database: {}, webapp: {}, nodeserver: {}};

config.database = 
    {
        ip: "localhost",
        port: "27017",
        dbname: "gymapp"
    };
config.database.address = "mongodb://" + config.database.ip + ":" + config.database.port + "/" + config.database.dbname;


config.webapp = 
    {
        ip: "localhost",
        port: "4200"
    };
config.webapp.address = "http://" + config.webapp.ip + ":" + config.webapp.port;

config.nodeserver = 
    {
        ip: "localhost",
        port: "3000"
    };
config.nodeserver.address = "http://" + config.nodeserver.ip + ":" + config.nodeserver.port

module.exports = config;