import React from "react";
import { Routes, Route } from "react-router-dom";
import Products from "./components/Products";
import ShippingForm from "./components/ShippingForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Products />} />
      <Route path="/checkout" element={<ShippingForm />} />
    </Routes>
  );
}

export default App;
