import React, { useEffect, useMemo, useState } from "react";

import { collection, getDocs, doc } from "firebase/firestore";

import { db } from "../../../firebaseConfig";

import GraficoDePizza from "../GraficoDePizza";

import LegendaTotalCategorias from "../LegendaTotalCategorias";
import LegendaTotalSubCategorias from "../LegendaTotalSubCategorias";
import Loading from "../utils/Loading";

const computedStyles = getComputedStyle(document.documentElement);

const cores = [
  computedStyles.getPropertyValue('--color-chart-1').trim(),
  computedStyles.getPropertyValue('--color-chart-2').trim(),
  computedStyles.getPropertyValue('--color-chart-3').trim(),
  computedStyles.getPropertyValue('--color-chart-4').trim(),
  computedStyles.getPropertyValue('--color-chart-5').trim(),
];

const useFirebaseData = (
  collectionName,
  documentIdParaSubcolecao = null,
  subcollectionName = null
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let ref;
        if (documentIdParaSubcolecao && subcollectionName) {
          const docRef = doc(db, collectionName, documentIdParaSubcolecao);
          ref = collection(docRef, subcollectionName);
        } else {
          ref = collection(db, collectionName);
        }
        const snap = await getDocs(ref);
        const fetchedData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(fetchedData);
      } catch (err) {
        console.error(`Erro ao buscar ${collectionName}:`, err);
        setError(`Erro ao carregar ${collectionName}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, documentIdParaSubcolecao, subcollectionName]);

  return { data, loading, error };
};

const processarDadosParaGrafico = (
  dados,
  nomeCampoCategoria = "categoria",
  nomeCampoValor = "valor",
  categoriaPadrao = "Outros"
) => {
  const categoriasTotais = {};
  dados.forEach((item) => {
    const categoria = item[nomeCampoCategoria] || categoriaPadrao;
    const valor = parseFloat(item[nomeCampoValor] || 0);
    categoriasTotais[categoria] = (categoriasTotais[categoria] || 0) + valor;
  });

  return Object.keys(categoriasTotais).map((categoria) => ({
    name: categoria,
    value: categoriasTotais[categoria],
  }));
};

const processarDadosParaSubCategorias = (
  dados,
  nomeCampoCategoria = "categoria",
  nomeCampoSubcategoria = "subcategoria",
  nomeCampoValor = "valor",
  categoriaPadrao = "Outro",
  subcategoriaPadrao = "Outros"
) => {
  const totaisPorSubcategoria = {};
  dados.forEach((item) => {
    const categoria = item?.[nomeCampoCategoria] || categoriaPadrao;
    const subcategoria = item?.[nomeCampoSubcategoria] || subcategoriaPadrao;
    const valor = parseFloat(item?.[nomeCampoValor] || 0);
    const chave = `${categoria}-${subcategoria}`;
    totaisPorSubcategoria[chave] = (totaisPorSubcategoria[chave] || 0) + valor;
  });

  const resultado = Object.entries(totaisPorSubcategoria).map(
    ([chave, total]) => {
      const [categoria, subcategoria] = chave.split("-");
      return {
        categoria: categoria,
        subcategoria: subcategoria,
        total: total,
      };
    }
  );

  return resultado.sort((a, b) => {
    if (a.categoria < b.categoria) return -1;
    if (a.categoria > b.categoria) return 1;
    if (a.subcategoria < b.subcategoria) return -1;
    if (a.subcategoria > b.subcategoria) return 1;
    return 0;
  });
};

const criarConfiguracaoCores = (dados, coresBase) => {
  const config = {};
  dados.forEach((item, index) => {
    config[item.name] = {
      label: item.name,
      color: coresBase[index % coresBase.length],
    };
  });

  return config;
};

export const RelatorioVisual = () => {
  const [totalCategoriasDespesas, setTotalCategoriasDespesas] = useState([]);
  const [totalCategoriasReceitas, setTotalCategoriasReceitas] = useState([]);
  const [totalSubCategoriasDespesas, setTotalSubCategoriasDespesas] = useState(
    []
  );
  const [totalSubCategoriasReceitas, setTotalSubCategoriasReceitas] = useState([]);

  const {
    data: despesasData,
    loading: loadingDespesas,
    error: errorDespesas,
  } = useFirebaseData("despesas");

  const {
    data: receitasData,
    loading: loadingReceitas,
    error: errorReceitas,
  } = useFirebaseData("recebimentos");

  const dadosDespesasCategoria = useMemo(
    () => processarDadosParaGrafico(despesasData),
    [despesasData]
  );

  const dadosReceitasCategoria = useMemo(
    () => processarDadosParaGrafico(receitasData),
    [receitasData]
  );

  const dadosDespesasSubcategoria = useMemo(
    () => processarDadosParaSubCategorias(despesasData),
    [despesasData]
  );

  const dadosReceitasSubcategoria = useMemo(() => processarDadosParaSubCategorias(receitasData), [receitasData])

  const chartConfigDespesas = useMemo(
    () => criarConfiguracaoCores(dadosDespesasCategoria, cores),
    [dadosDespesasCategoria, cores]
  );

  const chartConfigReceitas = useMemo(
    () =>
      criarConfiguracaoCores(dadosReceitasCategoria, cores.slice().reverse()),
    [dadosReceitasCategoria, cores]
  );

  const totalDespesas = useMemo(
    () => dadosDespesasCategoria.reduce((acc, curr) => acc + curr.value, 0),

    [dadosDespesasCategoria]
  );

  const totalReceitas = useMemo(
    () => dadosReceitasCategoria.reduce((acc, curr) => acc + curr.value, 0),

    [dadosReceitasCategoria]
  );

  useEffect(() => {
    setTotalCategoriasDespesas(dadosDespesasCategoria);
  }, [dadosDespesasCategoria]);

  useEffect(() => {
    setTotalCategoriasReceitas(dadosReceitasCategoria);
  }, [dadosReceitasCategoria]);

  useEffect(() => {
    setTotalSubCategoriasDespesas(dadosDespesasSubcategoria);
  }, [dadosDespesasSubcategoria]);

  useEffect(() => {
    setTotalSubCategoriasReceitas(dadosReceitasSubcategoria);
  }, [dadosReceitasSubcategoria]);

  if (loadingDespesas || loadingReceitas) {
    return <Loading />;
  }

  if (errorDespesas || errorReceitas) {
    return (
      <div>Erro ao carregar o relatório: {errorDespesas || errorReceitas}</div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-5 m-4">
        <GraficoDePizza
          titulo="Despesas"
          descricao="Visão geral das despesas"
          dados={dadosDespesasCategoria}
          configuracaoCores={chartConfigDespesas}
          total={totalDespesas}
          totalCategorias={totalCategoriasDespesas}
        />
        <GraficoDePizza
          titulo="Receitas"
          descricao="Visão geral das receitas"
          dados={dadosReceitasCategoria}
          configuracaoCores={chartConfigReceitas}
          total={totalReceitas}
          totalCategorias={totalCategoriasReceitas}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-5 m-4">
        <LegendaTotalCategorias
          totalCategorias={totalCategoriasDespesas}
          titulo="Total de Despesas por categoria"
          descricao="Detalhamento do total de despesas por categoria"
        />
        <LegendaTotalCategorias
          totalCategorias={totalCategoriasReceitas}
          titulo="Total de Receitas por categoria"
          descricao="Detalhamento do total de despesas por categoria"
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-5 m-4">
        <LegendaTotalSubCategorias
          totalSubCategorias={totalSubCategoriasDespesas}
          titulo="Total de Despesas por Sub-categoria"
          descricao="Detalhamento das despesas por sub-categoria"
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-5 m-4">
        <LegendaTotalSubCategorias
          totalSubCategorias={totalSubCategoriasReceitas}
          titulo="Total de Recebimentos por Sub-categoria"
          descricao="Detalhamento dos recebimentos por sub-categoria"
        />
      </div>
    </>
  );
};

export default RelatorioVisual;
