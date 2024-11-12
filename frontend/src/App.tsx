import SocketProvider from "./context/SocketProvider";
import Home from "./pages/Home";

function App() {
  return (
    <SocketProvider>
      <main className="home_page">
        <Home />
      </main>
    </SocketProvider>
  );
}

export default App;
