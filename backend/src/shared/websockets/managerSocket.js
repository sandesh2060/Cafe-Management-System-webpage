// file : backend/src/shared/websockets/managerSocket.js

let io;

const initializeManagerSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    socket.on('join-manager-room', () => {
      socket.join('managers');
      console.log('Manager joined room');
    });

    socket.on('leave-manager-room', () => {
      socket.leave('managers');
      console.log('Manager left room');
    });
  });
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

module.exports = {
  initializeManagerSocket,
  emitToRoom
};
