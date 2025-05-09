import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FuncionarioCombobox from "@/components/ComboboxFuncionarios";

function CadastroReceita() {
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoriasReceita, setCategoriasReceita] = useState([]);
  const [isFuncionario, setIsFuncionario] = useState(false);
  const [todosFuncionarios, setTodosFuncionarios] = useState([]);
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);
  const [funcionarioSelecionadoId, setFuncionarioSelecionadoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategoriasReceita = async () => {
      try {
        const receitasDocRef = doc(db, "categoriasFinanceiras", "receitas");
        const categoriasRef = collection(receitasDocRef, "categorias");
        const categoriasSnapshot = await getDocs(categoriasRef);

        const categoriasList = await Promise.all(
          categoriasSnapshot.docs.map(async (categoriaDoc) => {
            const subcategoriasRef = collection(
              categoriaDoc.ref,
              "subcategorias"
            );
            const subcategoriasSnapshot = await getDocs(subcategoriasRef);
            const subcategorias = subcategoriasSnapshot.docs.map((subDoc) => ({
              id: subDoc.id,
              nome: subDoc.data().nome,
            }));

            return {
              id: categoriaDoc.id,
              nome: categoriaDoc.data().nome,
              subcategorias,
            };
          })
        );

        setCategoriasReceita(categoriasList);
      } catch (error) {
        console.error("Erro ao buscar categorias de receita:", error);
      }
    };

    fetchCategoriasReceita();
  }, []);

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "funcionarios"));
        const funcionariosList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          nome: doc.data().nome,
        }));
        setTodosFuncionarios(funcionariosList);
        setFuncionariosFiltrados(funcionariosList);
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
      }
    };

    if (isFuncionario) {
      fetchFuncionarios();
    } else {
      setTodosFuncionarios([]);
      setFuncionariosFiltrados([]);
      setFuncionarioSelecionadoId("");
    }
  }, [isFuncionario]);

  const handleIsFuncionarioChange = (checked) => {
    setIsFuncionario(checked);
    setDescricao("");
    setFuncionarioSelecionadoId("");
  };

  const handleDescricaoInputChange = (e) => {
    setDescricao(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!data || !data.includes("-")) {
        throw new Error("Data inválida. Por favor, selecione uma data válida.");
      }

      const [ano, mes, dia] = data.split("-");
      const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      if (isNaN(dataObj)) {
        throw new Error("Data inválida.");
      }
      const timestamp = Timestamp.fromDate(dataObj);

      const valorNumerico = parseFloat(valor);

      if (isFuncionario && funcionarioSelecionadoId) {
        const funcionarioRef = doc(
          db,
          "funcionarios",
          funcionarioSelecionadoId
        );
        const funcionarioSnap = await getDoc(funcionarioRef);

        if (funcionarioSnap.exists()) {
          const currentSaldoTotal = funcionarioSnap.data().saldoTotal || 0;

          if (currentSaldoTotal < valorNumerico) {
            Toastify({
              text: "O funcionário não possui saldo suficiente para realizar essa operação",
              duration: 3000,
              close: false,
              gravity: "bottom",
              position: "right",
              stopOnFocus: true,
              style: {
                background: "#fb2c36",
              },
            }).showToast();
            setIsLoading(false);
            return;
          }

          const recebimentosDocRef = collection(db, "recebimentos");
          await addDoc(recebimentosDocRef, {
            categoria,
            subcategoria,
            data: timestamp,
            descricao,
            valor: valorNumerico,
          });

          const contribuicoesRef = collection(
            db,
            "funcionarios",
            funcionarioSelecionadoId,
            "transacoes"
          );
          await addDoc(contribuicoesRef, {
            data: timestamp,
            valor: valorNumerico,
            tipo: "saida",
            categoria,
            subcategoria,
            descricao,
          });

          const novoSaldoTotal = currentSaldoTotal - valorNumerico;
          await updateDoc(funcionarioRef, {
            saldoTotal: novoSaldoTotal,
          });

          Toastify({
            text: "Recebimento cadastrado com sucesso!",
            duration: 3000,
            close: false,
            gravity: "bottom",
            position: "right",
            stopOnFocus: true,
            style: {
              background: "oklch(72.3% 0.219 149.579)",
            },
          }).showToast();
        } else {
          throw new Error("Funcionário não encontrado.");
        }
      } else {
        const recebimentosDocRef = collection(db, "recebimentos");
        await addDoc(recebimentosDocRef, {
          categoria,
          subcategoria,
          data: timestamp,
          descricao,
          valor: valorNumerico,
        });
        Toastify({
          text: "Recebimento cadastrado com sucesso!",
          duration: 3000,
          close: false,
          gravity: "bottom",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "oklch(72.3% 0.219 149.579)",
          },
        }).showToast();
      }
    } catch (error) {
      console.error("Erro ao cadastrar recebimento:", error);
    } finally {
      setCategoria("");
      setData("");
      setDescricao("");
      setValor("");
      setIsFuncionario(false);
      setFuncionarioSelecionadoId("");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Recebimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="data" className="mb-2">
              Data
            </Label>
            <Input
              type="date"
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="categoria" className="mb-2">
              Categoria
            </Label>
            <Select
              value={categoria}
              onValueChange={(value) => {
                setCategoria(value);
                setSubcategoria("");
              }}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriasReceita.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {categoria && (
            <div>
              <Label htmlFor="subcategoria" className="mb-2">
                Subcategoria
              </Label>
              <Select
                value={subcategoria}
                onValueChange={setSubcategoria}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasReceita
                    .find((cat) => cat.id === categoria)
                    ?.subcategorias.map((sub) => (
                      <SelectItem key={sub.id} value={sub.nome}>
                        {sub.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="descricao" className="mb-2">
              Descrição
            </Label>
            {isFuncionario ? (
              <FuncionarioCombobox
                value={funcionarioSelecionadoId}
                onChange={(id) => {
                  setFuncionarioSelecionadoId(id);
                  const funcionario = funcionariosFiltrados.find(
                    (f) => f.id === id
                  );
                  setDescricao(funcionario?.nome || "");
                }}
                funcionarios={todosFuncionarios}
              />
            ) : (
              <Input
                type="text"
                id="descricao"
                value={descricao}
                onChange={handleDescricaoInputChange}
              />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-medium"
              checked={isFuncionario}
              onCheckedChange={handleIsFuncionarioChange}
            />
            <Label htmlFor="is-medium">É funcionário?</Label>
          </div>
          <div>
            <Label htmlFor="valor" className="mb-2">
              Valor
            </Label>
            <Input
              type="text"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar Recebimento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CadastroReceita;
