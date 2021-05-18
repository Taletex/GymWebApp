require('rootpath')();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const errorHandler = require('src/_middleware/error-handler');
const _ = require('lodash');
const fileManager = require('src/_helpers/fileManager');
var httpServer;


/* EXPRESS INITIALIZATION */
// create express app
const app = express();

// parse application/x-www-form-urlencoded, application/json, cookie
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));


/* HTTP/S SERVER INITIALIZATION */
var clientSocketList = [];
let socketSize = 0;

// set https or http basing on NODE_ENV
if (process.env.NODE_ENV === 'production') {
    try {
        httpServer = require('https').createServer({
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.cert')
        }, app)
        console.log("Setting Https server");
    } catch {
        httpServer = require('http').Server(app);
        console.log("Setting Http server");
    }
} else {
    httpServer = require('http').Server(app);
    console.log("Setting Http server");
}


/* SOCKET IO INITIALIZATION */
const io = require('socket.io')(httpServer, { cors: { origin: '*', credentials: true } });       // TODO: allow cors request but with credentials!
io.on('connection', (socket) => {
    let socketUserId = socket.client.id;
    socketSize++;
    console.log("User " + socketUserId + " connected in socket " + socket.id + " (" + socketSize + " users connected).");

    // When socket disconnects, remove from clientSocketList the element associated (using the socketId)
    socket.once("disconnect", (reason) => {
        socketSize--;
        _.remove(clientSocketList, function (s) { return s.socketId == socket.id; });
        console.log("User " + socketUserId + " disconnected with reason '" + reason + "' (" + socketSize + " users connected).");
    });

    // When client loads the account-service, accountInit event is emitted and used for update socket informations
    socket.once("accountInit", (ids) => {
        socket.accountId = ids.accountId | "";
        clientSocketList.push({ socketId: socket.id, socketUserId: socketUserId, accountId: ids.accountId, userId: ids.userId });
    })
});


/* FILE HOSTING INITIALIZATION */
// Serve all static files  inside files directory.
if (!fs.existsSync(fileManager.fileBaseDir))
    fs.mkdirSync(fileManager.fileBaseDir);
app.use(fileManager.fileBaseDir, express.static(__dirname + fileManager.fileBaseDir));


/* ROUTES INITIALIZATION */
app.get('/', (req, res) => { res.json({ "message": "Welcome to GymWebApp Nodeserver" }); });
app.use('/trainings', require('src/trainings/training.controller')(io, clientSocketList));
app.use('/exercises', require('src/exercises/exercise.controller'));
app.use('/users', require('src/users/user.controller')(io, clientSocketList));
app.use('/accounts', require('src/accounts/accounts.controller'));

// swagger docs route
app.use('/api-docs', require('src/_helpers/swagger'));

// global error handler
app.use(errorHandler);


/* START SERVER */
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 4000) : 4000;
const hostname = '0.0.0.0';
httpServer.listen(port, () => {
    console.log("Server listening on port " + port + (process.env.NODE_ENV === 'production' ? ' (production environment)' : ' (development environment)'));
})