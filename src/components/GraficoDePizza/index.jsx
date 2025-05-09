import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
} from "recharts";
import { formatarValor } from "../utils/FormatarValor";
import { motion } from "framer-motion";

const GraficoDePizza = ({
  titulo,
  descricao,
  dados,
  configuracaoCores,
  total,
}) => {
  const chartData = dados.map((item) => ({
    name: item.name,
    value: item.value,
    fill: configuracaoCores[item.name]?.color,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col flex-1"
    >
      <Card>
        <CardHeader className="items-center pb-0">
          <CardTitle>{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            className="mx-auto aspect-square max-h-[350px]"
            config={configuracaoCores}
          >
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    label="Categoria"
                    value="Valor"
                    formatter={(value) => `${formatarValor(value)}`}
                    itemStyle={{ color: "var(--foreground)" }}
                    labelStyle={{ color: "var(--foreground)" }}
                    payloadLabel={({ name }) => name}
                    payloadValue={({ value }) => `R$ ${value?.toFixed(2)}`}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={5}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${titulo}-${index}`} fill={entry.fill} />
                ))}
                {total > 0 && (
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan className="fill-foreground text-2xl font-bold">
                              {formatarValor(total)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-sm"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                )}
              </Pie>
              <Legend layout="horizontal" align="center" verticalAlign="bottom" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GraficoDePizza;
