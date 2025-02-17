import { Routes, Route } from "react-router-dom";
import Products from "../Pages/Products";
import Login from "../Pages/Login";
import Tables from "../Pages/Tables";
import Table from "../Pages/Table";
import Layout from "../Pages/Layout";
import PrivateRoute from "./PrivateRoute";
import AuthRoute from "./AuthRoute";
import MenuPerfil from "../Components/ProfileSettings/MenuPerfil";
import MenuOrders from "../Components/Orders/MenuOrders";
import MyOrders from "../Components/Tables/MyOrders";
import StartService from "../Components/Tables/StartService";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />

      <Route element={<PrivateRoute />}>
        <Route path="/start/:id" element={<StartService />} />
        <Route path="/table/:id" element={<Table />} />
        <Route path="/my-orders/:id" element={<MyOrders />} />

        <Route element={<Layout />}>
          <Route path="/tables" element={<Tables />} />
          <Route path="/" element={<Products />} />
          <Route path="/orders" element={<MenuOrders />} />
          <Route path="/profile-settings" element={<MenuPerfil />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
