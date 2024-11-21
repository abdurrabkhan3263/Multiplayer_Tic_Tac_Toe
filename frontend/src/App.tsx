import { Outlet } from "react-router-dom";
import SocketProvider from "./context/SocketProvider";

function App() {
  return (
    <SocketProvider>
      <main className="home_page font-gameFont">
        <Outlet />
      </main>
    </SocketProvider>
  );
}

export default App;
