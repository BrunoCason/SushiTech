import { useState } from "react";
import PendingProducts from "./PendingProducts";
import InProductionProducts from "./InProductionProducts";
import ReadyOrders from "./ReadyOrders";

const MenuOrders = () => {
  // Estado para controlar a seleção do menu
  const [activeComponent, setActiveComponent] =
    useState<string>("profileSettings");

  // Função para renderizar o componente de acordo com o menu selecionado
  const renderComponent = () => {
    switch (activeComponent) {
      case "pendingProducts":
        return <PendingProducts />;
      case "inProductionProducts":
        return <InProductionProducts />
      case "readyOrders":
        return <ReadyOrders />
      default:
        return <PendingProducts />;
    }
  };

  const menuItems = [
    { id: "pendingProducts", label: "Pedidos Realizados" },
    { id: "inProductionProducts", label: "Pedidos em Preparação" },
    { id: "readyOrders", label: "Pedidos Prontos" },
  ];

  return (
    <div className="container mx-auto mt-20 font-inter">
      <ul className="flex justify-around">
        {menuItems.map((item) => (
          <li key={item.id} className="font-bold text-3xl text-E6E6E">
            <button
              onClick={() => setActiveComponent(item.id)}
              className={`${activeComponent === item.id ? "text-black" : ""}`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div>{renderComponent()}</div>
    </div>
  );
};

export default MenuOrders;
