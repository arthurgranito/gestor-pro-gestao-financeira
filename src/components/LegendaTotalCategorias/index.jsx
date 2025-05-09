import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatarValor } from "../utils/FormatarValor";
import { motion } from "framer-motion";

const LegendaTotalCategorias = ({ totalCategorias, titulo, descricao }) => {
  return (
    <motion.div
      initial={{ scale: 0.5 }}
      whileInView={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col flex-1"
    >
      <Card className="flex flex-col flex-1">
        <CardHeader className="items-center pb-0">
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Categoria</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totalCategorias.map(categoria => (
                <TableRow key={categoria.name}>
                  <TableCell>{categoria.name}</TableCell>
                  <TableCell className="text-right"> {formatarValor(categoria.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LegendaTotalCategorias;
