import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { format, fromUnixTime } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Paginacao from '@/components/Paginacao';
import { formatarValor } from '@/components/utils/FormatarValor';
import { Select } from '@/components/ui/select';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Loading from '@/components/utils/Loading';

function RelatorioFuncionarios() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [paginaTransacoes, setPaginaTransacoes] = useState(1);
  const [funcionariosSaldoTotal, setFuncionariosSaldoTotal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [searchNome, setSearchNome] = useState('');
  const [filteredfuncionariosSaldoTotal, setFilteredFuncionariosSaldoTotal] = useState([]);
  const [setores, setSetores] = useState([]);
  const [ordenacao, setOrdenacao] = useState(null);
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState("desc");
  const [setorFiltro, setSetorFiltro] = useState("");
  const [cargos, setCargos] = useState([]);
  const [cargoFiltro, setCargoFiltro] = useState("");
  const itensPorPagina = 10;
  const transacoesPorPagina = 5;

  const totalPaginas = Math.ceil(filteredfuncionariosSaldoTotal.length / itensPorPagina);

  useEffect(() => {
    const fetchSaldoTotalFuncionarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'funcionarios'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          saldoTotal: doc.data().saldoTotal,
          nome: doc.data().nome,
          cargo: doc.data().cargo,
          setor: doc.data().setor,
        }));
        data.sort((a, b) => a.nome.localeCompare(b.nome));
        setFuncionariosSaldoTotal(data);
        setFilteredFuncionariosSaldoTotal(data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar débitos dos funcionários:', err);
        setError('Erro ao carregar os saldos totais dos funcionários.');
        setLoading(false);
      }
    };

    const fetchSetores = async () => {
      setLoading(true);
      try {
        const setoresRef = collection(db, 'setores');
        const setoresSnap = await getDocs(setoresRef);

        const setoresData = setoresSnap.docs.map((docSetor) => ({
          id: docSetor.id,
          nome: docSetor.data().nome,
        }));
        setSetores(setoresData);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
        setSetores([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCargos = async () => {
      setLoading(true);
      try {
        const cargosRef = collection(db, 'cargos');
        const cargosSnap = await getDocs(cargosRef);

        const cargosData = cargosSnap.docs.map((docCargo) => ({
          id: docCargo.id,
          nome: docCargo.data().nome,
        }));
        setCargos(cargosData);
      } catch (error) {
        console.error("Erro ao buscar cargos:", error);
        setCargos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaldoTotalFuncionarios();
    fetchSetores();
    fetchCargos();
  }, []);

  const handleOrdernar = (coluna) => {
    if (coluna === ordenacao) {
      setDirecaoOrdenacao(direcaoOrdenacao === "asc" ? "desc" : "asc");
    } else {
      setOrdenacao(coluna);
      setDirecaoOrdenacao("asc");
    }
    setFilteredFuncionariosSaldoTotal(ordenarFuncionarios(funcionariosSaldoTotal));
  }

  const ordenarFuncionarios = useCallback(
    (listaDeFuncionarios) => {
      if (!ordenacao) return listaDeFuncionarios;

      return [...listaDeFuncionarios].sort((a, b) => {
        let valorA, valorB;

        switch (ordenacao) {
          case "nome":
            valorA = a.nome || "";
            valorB = b.nome || "";
            break;
          case "setor":
            valorA = a.setor || "";
            valorB = b.setor || "";
            break;
          case "cargo":
            valorA = a.cargo || "";
            valorB = b.setor || "";
            break;
          case "saldoTotal":
            valorA = a.saldoTotal || 0;
            valorB = b.saldoTotal || 0;
            break;
          default:
            return 0;
        }

        if (typeof valorA === "string" && typeof valorB === "string") {
          return direcaoOrdenacao === "asc"
            ? valorA.localeCompare(valorB)
            : valorB.localeCompare(valorA);
        }

        if (valorA < valorB) {
          return direcaoOrdenacao === "asc" ? -1 : 1;
        }
        if (valorA > valorB) {
          return direcaoOrdenacao === "asc" ? 1 : -1;
        }
        return 0;
      })
    },
    [ordenacao, direcaoOrdenacao]
  )

  useEffect(() => {
    const fetchTransacoes = async () => {
      if (selectedFuncionario?.id) {
        const transacoesRef = collection(db, 'funcionarios', selectedFuncionario.id, 'transacoes');
        const querySnapshot = await getDocs(transacoesRef);
        const transacoesData = querySnapshot.docs.map(doc => doc.data());
        setTransacoes(transacoesData);
      } else {
        setTransacoes([]);
      }
    };

    fetchTransacoes();
  }, [selectedFuncionario?.id, isModalOpen]);

  const handleOpenModal = (funcionario) => {
    setPaginaTransacoes(1);
    setSelectedFuncionario(funcionario);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFuncionario(null);
  };

  const filtrarFuncionarios = useCallback(() => {
    const nome = searchNome.toLowerCase();
    const setorSelecionado = setorFiltro;
    const cargoSelecionado = cargoFiltro;
  
    let resultadosFiltrados = funcionariosSaldoTotal.filter((funcionario) => {
      const nomeLowerCase = funcionario.nome.toLowerCase();
      const funcionarioSetor = funcionario.setor || '';
      const funcionarioCargo = funcionario.cargo || '';
  
      const filtroNome = !searchNome || nomeLowerCase.includes(nome);
  
      let filtroSetor = true;
      if (
        setorSelecionado &&
        setorSelecionado !== "Todos os Setores" &&
        setorSelecionado !== ""
      ) {
        filtroSetor = funcionarioSetor === setorSelecionado;
      }
  
      let filtroCargo = true;
      if (
        cargoSelecionado &&
        cargoSelecionado !== "Todos os Cargos" &&
        cargoSelecionado !== ""
      ) {
        filtroCargo = funcionarioCargo === cargoSelecionado;
      }
  
      return (
        filtroNome && filtroCargo && filtroSetor
      );
    });
  
    setFilteredFuncionariosSaldoTotal(ordenarFuncionarios(resultadosFiltrados));
    setPaginaAtual(1);
  }, [
    funcionariosSaldoTotal,
    searchNome,
    setorFiltro,
    cargoFiltro,
    ordenarFuncionarios,
  ]);
    

  useEffect(() => {
    filtrarFuncionarios();
  }, [
    funcionariosSaldoTotal,
    searchNome,
    setorFiltro,
    cargoFiltro,
    filtrarFuncionarios,
  ]);

  const formatDate = (data) => {
    if (data instanceof Timestamp) {
      data = fromUnixTime(data.seconds);
    } else if (typeof data === 'string') {
      data = new Date(data)
    }

    const validDate = data instanceof Date && !isNaN(data);
    if (!validDate) {
      return 'Data Inválida';
    }

    return format(data, 'dd/MM/yy', { locale: ptBR });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const funcionariosPaginados = filteredfuncionariosSaldoTotal.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  )

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Relatório dos Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center justify-center">
            <div>
              <Label htmlFor="search" className="mb-2">Pesquisar Funcionário:</Label>
              <Input
                type="text"
                id="search"
                placeholder="Digite o nome do funcionário..."
                value={searchNome}
                onChange={(e) => setSearchNome(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="setorFiltro" className="mb-2">Filtrar por setor:</Label>
              <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Todos os Setores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos os Setores">
                    Todos os Setores
                  </SelectItem>
                  {setores.map((setor) => (
                    <SelectItem key={setor.id} value={setor.nome}>{setor.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cargoFiltro" className="mb-2">Filtrar por cargo:</Label>
              <Select value={cargoFiltro} onValueChange={setCargoFiltro}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Todos os Cargos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos os Cargos">
                    Todos os Cargos
                  </SelectItem>
                  {cargos.map((cargo) => (
                    <SelectItem key={cargo.id} value={cargo.nome}>{cargo.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {funcionariosPaginados.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleOrdernar("nome")}>Nome {ordenacao === "nome" && (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleOrdernar("cargo")}>Cargo {ordenacao === "cargo" && (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleOrdernar("setor")}>Setor {ordenacao === "setor" && (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleOrdernar("saldoTotal")}>Saldo Total {ordenacao === "saldoTotal" && (direcaoOrdenacao === "asc" ? " ▲" : " ▼")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionariosPaginados.map((funcionario) => (
                    <TableRow key={funcionario.id} className="w-full cursor-pointer hover:underline" onClick={() => handleOpenModal(funcionario)}>
                      <TableCell>{funcionario.nome}</TableCell>
                      <TableCell>{funcionario.cargo}</TableCell>
                      <TableCell>{funcionario.setor}</TableCell>
                      <TableCell className="text-right">{formatarValor(funcionario.saldoTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Paginacao onPageChange={setPaginaAtual} paginaAtual={paginaAtual} totalPaginas={totalPaginas} />
            </>
          ) : (
            <h1 className='mt-4 text-center text-xl font-bold'>Nenhum funcionário encontrado!</h1>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedFuncionario?.nome}</DialogTitle>
            <DialogDescription>
              Histórico de transações
            </DialogDescription>
          </DialogHeader>
          {selectedFuncionario && (
            <div className='max-w-full overflow-auto'>
              <Card className="contribuicoes-table w-full min-w-[300]">
                <CardHeader>
                  <CardTitle>Saldo Total: {formatarValor(selectedFuncionario.saldoTotal)}</CardTitle>
                  <CardDescription>Transações:</CardDescription>
                </CardHeader>
                <CardContent>
                  {transacoes.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transacoes.slice((paginaTransacoes - 1) * transacoesPorPagina, paginaTransacoes * transacoesPorPagina).map((transacao, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(transacao.data)}</TableCell>
                              <TableCell>{transacao.descricao}</TableCell>
                              <TableCell className="capitalize">{transacao.tipo}</TableCell>
                              <TableCell className="text-right">{formatarValor(transacao.valor)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {transacoes.length > transacoesPorPagina && (
                        <Paginacao paginaAtual={paginaTransacoes} onPageChange={setPaginaTransacoes} totalPaginas={Math.ceil(transacoes.length / transacoesPorPagina)} />
                      )}
                    </>
                  ) : (
                    <p className='text-xs text-center'>Nenhuma transação registrada para este funcionário.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RelatorioFuncionarios;