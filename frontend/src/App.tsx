import RoomProvider from "./context/RoomContext";
import SocketProvider from "./context/SocketProvider";
import Home from "./pages/Home";

function App() {
  return (
    <SocketProvider>
      <RoomProvider>
        <main className="home_page">
          <Home />
        </main>
      </RoomProvider>
    </SocketProvider>
  );
}

export default App;
