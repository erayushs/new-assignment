import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
// import NewApp from "./pages/NewApp.jsx";
import Form from "./pages/Form.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/form" element={<Form />} />
        {/* <Route path="/newApp" element={<NewApp />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
