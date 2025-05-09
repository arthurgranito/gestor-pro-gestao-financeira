import { Route, Routes } from "react-router-dom";
import Nav from "./components/Nav";
import RelatorioVisual from "./components/RelatorioVisual";
import Despesas from "./components/Despesas";
import Receitas from "./components/Recebimentos";
import React from "react";
import { ThemeProvider } from "./components/theme-provider";
import Funcionarios from "./components/Funcionarios";

function App() {
  return (
    <ThemeProvider>
      <>
        <Nav />
        <Routes>
          <Route path="/" element={<RelatorioVisual />} />
          <Route path="/despesas" element={<Despesas />} />
          <Route path="/recebimentos" element={<Receitas />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
        </Routes>
      </>
    </ThemeProvider>
  );
}

export default App;
