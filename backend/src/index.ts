import server from "./server";
import SocketController from "./controller/socket.controller";

const socketController = new SocketController();
socketController.playGame();

server.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT} 🚀 || http://localhost:${process.env.PORT}`
  );
});
