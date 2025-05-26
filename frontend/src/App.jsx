import React from 'react';
import ProductList from './pages/ProductList';
import Sign from './pages/signup';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Admin from './pages/prupdate';
import P from "./pages/product"
import Server from "./pages/server";
import Test from "./test"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/hii" element={< Sign/>} />
        <Route path="/admin" element={< Admin/>} />
        <Route path="/server" element={<Server />} />
        <Route path="/test" element={<Test />} />


        <Route path="/product" element={<P />} />
        <Route path="/hi" element={<ProductList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
