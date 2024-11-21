import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Play from "./pages/Play.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import Home from "./pages/Home.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="/play/:roomId?" element={<Play />} />
    </Route>,
  ),
);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <>
    <RouterProvider router={router} />
    <Toaster />
  </>,
  // </StrictMode>,
);
