const mongoose = require('mongoose');
const Msg = require('./models/message')
const mongoDB = 'mongodb+srv://Ahmedkhamis:1234wassali@cluster0.s7oxpx6.mongodb.net/message-database?retryWrites=true&w=majority'
mongoose.connect(mongoDB,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
  console.log("Successfully connected to MongoDB");
}).catch(error=>console.log(error));

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const { addUser,removeUser, getUser,getUsersInRoom} = require("./utils/users")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

  io.on("connection", (socket) => {
    console.log("New WebSocket connection");

    Msg.find().then((result)=>{
      socket.emit("output-messages",result );
    })
  
      socket.on("join", ({username, room}, callback) => {
      const {error, user} = addUser({id: socket.id , username, room})

      if (error) {
        return callback (error);
      }

      socket.join(user.room);

      socket.emit("message", generateMessage("Admin","Welcome!"));
      socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`));
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
      callback();
    });

// io.on("connection",  (socket) => {
//   console.log("New WebSocket connection");
//     const socketId =  (socket.id)
//     console.log(socketId)

//    socket.join(socketId);
//    io.to(socketId).emit("message", generateMessage("Welcome!"));


  

  socket.on("sendMessage", (msg, callback) => {
    const messages = new Msg({msg});
    console.log(messages);
    const user = getUser(socket.id);
    console.log(socket.id, user)

    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed!");
    }

    messages.save().then(() => {
      io.to(user.room).emit("message", generateMessage(user.username,msg));
      
    callback();
  });
    });
 
    


  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", generateMessage("Admin",`${user.username} has left!`));
      io.to(user.room).emit('roomData',{
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
