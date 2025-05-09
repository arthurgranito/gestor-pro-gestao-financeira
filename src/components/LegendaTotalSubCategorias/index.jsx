import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Paginacao from "../Paginacao";
import { formatarValor } from "../utils/FormatarValor";
import { motion } from "framer-motion";

const LegendaTotalSubCategorias = ({ totalSubCategorias, titulo, descricao }) => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const totalPaginas = Math.ceil(totalSubCategorias.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const itensPaginaAtual = totalSubCategorias.slice(indiceInicio, indiceFim);

  return (
    <motion.div
      initial={{ translateX: -100 }}
      whileInView={{ translateX: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col flex-1"
    >
      <Card>
        <CardHeader className="items-center pb-0">
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Categoria</TableHead>
                <TableHead>Subcategoria</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itensPaginaAtual.map((categoria) => (
                <TableRow key={`${categoria.categoria}-${categoria.subcategoria}`}>
                  <TableCell>{categoria.categoria}</TableCell>
                  <TableCell>{categoria.subcategoria}</TableCell>
                  <TableCell className="text-right">
                    {formatarValor(categoria.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPaginas > 1 && (
            <Paginacao onPageChange={setPaginaAtual} paginaAtual={paginaAtual} totalPaginas={totalPaginas} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LegendaTotalSubCategorias;
