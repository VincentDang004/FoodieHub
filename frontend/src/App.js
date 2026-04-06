import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import Navbar from "./Navbar";
import Cart from "./Cart";
import Orders from "./Orders";
import Profile from "./Profile";
import Categories from "./Categories";
import Restaurants from "./Restaurants";
import Footer from "./Footer";
import Admin from "./Admin";
import Payment from "./Payment";

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="restaurants" element={<Restaurants />} />
          <Route path="categories" element={<Categories />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payment/:orderId" element={<Payment />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
