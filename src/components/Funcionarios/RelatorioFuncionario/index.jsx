import React, { useState, useEffect } from 'react';
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

function RelatorioFuncionarios() {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [paginaTransacoes, setPaginaTransacoes] = useState(1);
  const [funcionariosSaldoTotal, setFuncionariosSaldoTotal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredfuncionariosSaldoTotal, setFilteredFuncionariosSaldoTotal] = useState([]);
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

    fetchSaldoTotalFuncionarios();
  }, []);

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

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = funcionariosSaldoTotal.filter(funcionario => funcionario.nome.toLowerCase().includes(term));
    setFilteredFuncionariosSaldoTotal(filtered);
    setPaginaAtual(1);
  };
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
    return <div>Carregando saldo dos funcionários...</div>;
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center">
            <div>
              <Label htmlFor="search" className="mb-2">Pesquisar Funcionário:</Label>
              <Input
                type="text"
                id="search"
                placeholder="Digite o nome do funcionário..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Funcionário</TableHead>
                <TableHead className="text-right">Saldo Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionariosPaginados.map(funcionario => (
                <TableRow key={funcionario.id} className="w-full cursor-pointer hover:underline" onClick={() => handleOpenModal(funcionario)}>
                  <TableCell>{funcionario.nome}</TableCell>
                  <TableCell className="text-right">R${funcionario.saldoTotal?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Paginacao onPageChange={setPaginaAtual} paginaAtual={paginaAtual} totalPaginas={totalPaginas} />
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
                  <CardTitle>Saldo Total: R$ {selectedFuncionario.saldoTotal?.toFixed(2)}</CardTitle>
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
                              <TableCell className="text-right">R$ {transacao.valor?.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {transacoes.length > transacoesPorPagina && (
                        <Paginacao paginaAtual={paginaTransacoes} onPageChange={setPaginaTransacoes} totalPaginas={Math.ceil(transacoes.length / transacoesPorPagina)}/>
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