var parent = module.parent.exports 
  , app = parent.app
  , server = parent.server
  , fs = require('fs')
  , pty = require('pty.js')
  , sio = require('socket.io');

var term = pty.spawn('bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

//console.log(term);
/*
term.on('data', function(data) {
  console.log("Incoming: " + data.toString());
});
*/

var io = sio.listen(server);

io.configure(function() {
  io.enable('browser client minification');
  io.enable('browser client gzip');
  //node js socketio Unexpected response code: 502
  // http://stackoverflow.com/questions/12569451/unexpected-response-code-502-error-when-using-socket-io-with-appfog
  io.set('transports', ['xhr-polling']);

});


io.sockets.on('connection', function (socket) {
    var sessionId    = socket.handshake.sessionId; //access to the saved data.sessionId on auth

    term.on('data', function(data) {
        console.log("Incoming: " + data.toString());
        socket.emit('cmdResponse', data.toString());
    });


    socket.on('sendCmd', function(data){
	    //socket.broadcast.to("room_"+user["_id"]).emit('challenge request', {userChallenging:socket.handshake.userData});
        console.log(data);
        term.write(data+"\r");
        console.log(term.process);
        //console.log(socket);
	    //socket.broadcast.to(data.user).emit('chatIn', socket.username, data);
        //io.sockets.emit('chatIn', socket.username, data);
	    //socket.broadcast.emit('chatIn', {msg:data.msg});
    });

    socket.on('readFile', function(fileName){
	    //socket.broadcast.to("room_"+user["_id"]).emit('challenge request', {userChallenging:socket.handshake.userData});
        //console.log(data);
        //term.write(data+"\r");
        //console.log(term.process);
        //console.log(socket);
	    //socket.broadcast.to(data.user).emit('chatIn', socket.username, data);
        //io.sockets.emit('chatIn', socket.username, data);
	    //socket.broadcast.emit('chatIn', {msg:data.msg});
        fs.readFile(fileName, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }else{
            socket.emit('fileReadResponse', fileName, data);
          }

        });
    });

    socket.on('disconnect', function () {
        console.log("Disconnected "+socket.username);                                                                                                                     
        console.log("Sockets in room "+io.sockets.clients(socket.username).length)
        if(io.sockets.clients(socket.username).length==1){
            //Update Status in DB
            //User.logout(socket.username);
        }   
        //to all sockets
        io.sockets.emit('logoutUser', socket.username);

    });
});
