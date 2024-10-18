import { useState } from "react";
import PendingProducts from "./PendingProducts";
import InProductionProducts from "./InProductionProducts";
import ReadyOrders from "./ReadyOrders";

const MenuOrders = () => {
  const [activeComponent, setActiveComponent] =
    useState<string>("pendingProducts"); // Mudando para 'pendingProducts'

  // Função para renderizar o componente de acordo com o menu selecionado
  const renderComponent = () => {
    switch (activeComponent) {
      case "pendingProducts":
        return <PendingProducts />;
      case "inProductionProducts":
        return <InProductionProducts />;
      case "readyOrders":
        return <ReadyOrders />;
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
      <ul className="flex flex-wrap sm:flex-nowrap justify-around items-center">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className="mb-2 font-bold text-lg md:text-3xl px-10"
          >
            <button
              onClick={() => setActiveComponent(item.id)}
              className={`${
                activeComponent === item.id ? "text-CC3333" : "text-gray-300"
              }`}
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
