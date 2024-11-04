import { useNavigate } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  const navigate = useNavigate();

  return (
    <main className="home_page flex h-screen w-screen items-center justify-center">
      <Home />
    </main>
  );
}

export default App;
