import React, { useState, useEffect, useCallback } from 'react';
import {
    collection,
    getDocs
} from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import Paginacao from '@/components/Paginacao';
import { formatarValor } from '@/components/utils/FormatarValor';
import Loading from '@/components/utils/Loading';

function RelatorioReceitas() {
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;
    const [receitas, setReceitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataInicialFiltro, setDataInicialFiltro] = useState('');
    const [dataFinalFiltro, setDataFinalFiltro] = useState('');
    const [descricaoFiltro, setDescricaoFiltro] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [subcategoriaFiltro, setSubcategoriaFiltro] = useState('');
    const [receitasFiltradas, setReceitasFiltradas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubcategorias] = useState([]);
    const [ordenacao, setOrdenacao] = useState(null);
    const [direcaoOrdenacao, setDirecaoOrdenacao] = useState('desc');

    useEffect(() => {
        const fetchReceitas = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'recebimentos'));
                const receitasData = querySnapshot.docs.map(doc => {
                    const dataBruta = doc.data().data;
                    const dataConvertida = dataBruta?.seconds ? new Date(dataBruta.seconds * 1000) : new Date(dataBruta);

                    return {
                        id: doc.id,
                        ...doc.data(),
                        data: isNaN(dataConvertida.getTime()) ? null : dataConvertida
                    }
                });

                const sortedReceitas = [...receitasData].sort((a, b) => {
                    const dateA = a.data?.seconds ? new Date(a.data.seconds * 1000) : new Date(a.data);
                    const dateB = b.data?.seconds ? new Date(b.data.seconds * 1000) : new Date(b.data);
                    return dateA.getTime() - dateB.getTime();
                });
                setReceitas(sortedReceitas);
                setReceitasFiltradas(sortedReceitas);
                setLoading(false);
            } catch (err) {
                console.error('Erro ao buscar receitas:', err);
                setError('Erro ao carregar o relatório de receitas.');
                setLoading(false);
            }
        };

        const fetchCategorias = async () => {
            try {
                const categoriasDocRef = collection(db, 'categoriasFinanceiras', 'receitas', 'categorias');
                const querySnapshot = await getDocs(categoriasDocRef);
                const categoriasData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    nome: doc.data()?.nome
                }));
                setCategorias([{ id: null, nome: 'Todas as Categorias' }, ...categoriasData]);
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
            }
        };

        fetchReceitas();
        fetchCategorias();
    }, []);

    useEffect(() => {
        const fetchSubcategorias = async () => {
            if (categoriaFiltro) {
                try {
                    const subcategoriasDocRef = collection(db, 'categoriasFinanceiras', 'receitas', 'categorias', categoriaFiltro, 'subcategorias');
                    const querySnapshot = await getDocs(subcategoriasDocRef);
                    const subcategoriasData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        nome: doc.data()?.nome
                    }));
                    setSubcategorias([{ id: null, nome: 'Todas as Subcategorias' }, ...subcategoriasData]);
                } catch (err) {
                    console.error('Erro ao buscar subcategorias:', err);
                }
            } else {
                setSubcategorias([]);
            }
        }

        fetchSubcategorias();
    }, [categoriaFiltro]);

    const handleOrdenar = (coluna) => {
        if (coluna === ordenacao) {
            setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
        } else {
            setOrdenacao(coluna);
            setDirecaoOrdenacao('asc');
        }
        setReceitasFiltradas(ordenarReceitas(receitas));
    };

    const ordenarReceitas = useCallback(
        (lista) => {
            if (!ordenacao) return lista;

            return [...lista].sort((a, b) => {
                let valorA, valorB;

                switch (ordenacao) {
                    case "data":
                        valorA = a.data?.seconds
                            ? new Date(a.data.seconds * 1000)
                            : new Date(a.data);
                        valorB = b.data?.seconds
                            ? new Date(b.data.seconds * 1000)
                            : new Date(b.data);
                        break;
                    case "descricao":
                        valorA = a.descricao || "";
                        valorB = b.descricao || "";
                        break;
                    case "valor":
                        valorA = a.valor || 0;
                        valorB = b.valor || 0;
                        break
                    case "categoria":
                        valorA = a.categoria || "";
                        valorB = b.categoria || "";
                        break;
                    case "subcategoria":
                        valorA = a.subcategoria || "";
                        valorB = b.subcategoria || "";
                        break;
                    default:
                        return 0;
                }

                if (typeof valorA === "string" && typeof valorB === "string") {
                    return direcaoOrdenacao === "asc" ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
                }

                return direcaoOrdenacao === "asc" ? valorA - valorB : valorB - valorA;
            });
        },
        [ordenacao, direcaoOrdenacao]
    )

    const filtrarReceitas = useCallback(() => {
        const dataInicial = dataInicialFiltro ? new Date(dataInicialFiltro) : null;
        const dataFinal = dataFinalFiltro ? new Date(dataFinalFiltro) : null;
        const termoDescricao = descricaoFiltro.toLowerCase();
        const categoriaSelecionada = categoriaFiltro;
        const subcategoriaSelecionada = subcategoriaFiltro;

        let resultadosFiltrados = receitas.filter(receita => {
            const receitaDate = receita.data?.seconds ? new Date(receita.data.seconds * 1000) : new Date(receita.data);
            const formattedReceitaDate = format(receitaDate, 'yyyy-MM-dd');
            const descricaoLowerCase = receita.descricao?.toLowerCase() || '';
            const receitaCategoria = receita.categoria || '';
            const receitaSubcategoria = receita.subcategoria || '';

            const filtroData = (!dataInicial || formattedReceitaDate >= format(dataInicial, 'yyyy-MM-dd')) && (!dataFinal || formattedReceitaDate <= format(dataFinal, 'yyyy-MM-dd'));

            const filtroDescricao = !descricaoFiltro || descricaoLowerCase.includes(termoDescricao);

            const filtroCategoria = !categoriaSelecionada || receitaCategoria === categoriaSelecionada;

            const filtroSubcategoria = !subcategoriaSelecionada || receitaSubcategoria === subcategoriaSelecionada || !receitaSubcategoria;

            return filtroData && filtroDescricao && filtroCategoria && filtroSubcategoria;
        })

        setReceitasFiltradas(ordenarReceitas(resultadosFiltrados));
    }, [receitas, dataInicialFiltro, dataFinalFiltro, descricaoFiltro, categoriaFiltro, subcategoriaFiltro, ordenarReceitas]);


    useEffect(() => {
        if (receitas.length > 0) {
            filtrarReceitas();
        }
    }, [receitas, dataInicialFiltro, dataFinalFiltro, descricaoFiltro, categoriaFiltro, filtrarReceitas]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const formatarData = (data) => {
        const dataFormatada = data ? format(data, 'dd/MM/yy', { locale: ptBR }) : 'Data Inválida'

        return dataFormatada;
    }

    const indiceInicial = (paginaAtual - 1) * itensPorPagina;
    const indiceFinal = indiceInicial + itensPorPagina;
    const receitasPaginadas = receitasFiltradas.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(receitasFiltradas.length / itensPorPagina);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Relatório de Receitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="dataInicialFiltro" className="mb-2">Data Inicial</Label>
                        <Input
                            type="date"
                            id="dataInicialFiltro"
                            value={dataInicialFiltro}
                            onChange={(e) => setDataInicialFiltro(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="dataFinalFiltro" className="mb-2">Data Final</Label>
                        <Input
                            type="date"
                            id="dataFinalFiltro"
                            value={dataFinalFiltro}
                            onChange={(e) => setDataFinalFiltro(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="descricaoFiltro" className="mb-2">Pesquisar Descrição</Label>
                        <Input
                            type="text"
                            id="descricaoFiltro"
                            placeholder="Digite a descrição..."
                            value={descricaoFiltro}
                            onChange={(e) => setDescricaoFiltro(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="categoriaFiltro" className="mb-2">Filtrar por Categoria</Label>
                        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todas as Categorias" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Todas as Categorias</SelectItem>
                                {categorias.slice(1).map((categoria) => (
                                    <SelectItem key={categoria.id} value={categoria.nome}>{categoria.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {categoriaFiltro && (
                        <div>
                            <Label htmlFor="subcategoriaFiltro" className="mb-2">Filtrar por Subcategoria</Label>
                            <Select value={subcategoriaFiltro} onValueChange={setSubcategoriaFiltro}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todas as Subcategorias" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={null}>Todas as Subcategorias</SelectItem>
                                    {subcategorias.slice(1).map((subcategoria) => (
                                        <SelectItem key={subcategoria.id} value={subcategoria.nome}>{subcategoria.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer" onClick={() => handleOrdenar('data')}>
                                    Data
                                    {ordenacao === 'data' && (direcaoOrdenacao === 'asc' ? ' ▲' : ' ▼')}
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleOrdenar("categoria")}>Categoria {ordenacao === "categoria" && (direcaoOrdenacao === "asc" ? ' ▲' : ' ▼')}</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleOrdenar("subcategoria")}>Subcategoria {ordenacao === "subcategoria" && (direcaoOrdenacao === "asc" ? '▲' : ' ▼')}</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleOrdenar("descricao")}>Descrição {ordenacao === "descricao" && (direcaoOrdenacao === "asc" ? ' ▲' : ' ▼')}</TableHead>
                                <TableHead className="text-right cursor-pointer" onClick={() => handleOrdenar("valor")}>Valor {ordenacao === "valor" && (direcaoOrdenacao === "asc" ? ' ▲' : ' ▼')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receitasPaginadas.map(receita => (
                                <TableRow key={receita.id}>
                                    <TableCell>{formatarData(receita.data)}</TableCell>
                                    <TableCell className="capitalize">{receita.categoria}</TableCell>
                                    <TableCell className="capitalize">{receita.subcategoria}</TableCell>
                                    <TableCell className="capitalize">{receita.descricao}</TableCell>
                                    <TableCell className="text-right">{formatarValor(receita.valor)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} onPageChange={setPaginaAtual} />
                </div>
            </CardContent>
        </Card>
    );
}

export default RelatorioReceitas;