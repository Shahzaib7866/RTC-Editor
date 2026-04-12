
import express from 'express';
import { createServer } from 'http'; //socketio kam krne k liye http server ki jarurat hoti hai
import { Server } from 'socket.io';
import { YSocketIO } from "y-socket.io/dist/server"  

//Yjs is a library for building collaborative multi-user applications
//YSocketIO is a wrapper around Socket.IO that enables Yjs awareness

const app = express();
const httpServer = createServer(app); //http server create krna


// socket io server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
}); 

const ySocketIO = new YSocketIO(io);
ySocketIO.initialize();


//2 healtth check route...kis server ki health kharab hai
app.get('/', (req, res) => {
  res.status(200).json({ message: 'helloo world' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


httpServer.listen(3001, () => {
  console.log('Server is running on port 3001');
});




