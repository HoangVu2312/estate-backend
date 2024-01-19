const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
require('dotenv').config();
const { verifyToken } = require('./authorization/authorization');

require('./connection')   // only need to import so database connection can be used in any other files
const server = http.createServer(app);  // express server
const {Server} = require("socket.io");  // socketio server

// connect socket io server vs express server and alllow internal connection
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  },
});



// array of online user
let users = [];  

// func to add every conected user
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};



const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

// get specific user to send message
const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

// Listen to connected events
io.on("connection", (socket) => {
  // console.log(`here is the client ${socket.id}`); //=> socket.id = connected user

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id); // => add to users[]
    io.emit("getUsers", users); // send users[] to client
  });

  socket.on("send_private_message", (messageData) => {
    const { senderId, receiverId, message, time} = messageData;
    const user = getUser(receiverId); // specific user need to send msg
    io.to(user?.socketId).emit("get_private_message", {
      senderId,
      message,
      time,
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id); // => remove that user from array
    io.emit("getUsers", users); // => send the new user array
  });
})



// configuration
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());



// Import required routes
const userRoutes = require('./routes/userRoute')
const propertyRoutes = require('./routes/propertyRoute')
const cloudinaryRoutes = require('./routes/cloudinaryRoute')
const AppointmentRoutes = require('./routes/appointmentRoute')

// Defining routes for the app:
app.use('/users', userRoutes);
app.use('/properties', propertyRoutes);
app.use('/images', cloudinaryRoutes);
app.use('/appointments',verifyToken, AppointmentRoutes);


// run serser
server.listen(4000, () => {
    console.log('server runing at port', 4000)
});

app.set('socketio', io);
