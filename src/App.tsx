import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/index.tsx";
import "./App.css";
import React from 'react'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
