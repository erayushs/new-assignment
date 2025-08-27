import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "./pages/Dashboard.tsx";
// import NewApp from "./pages/NewApp.jsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/newApp" element={<NewApp />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
