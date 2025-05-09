import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { TabsContent } from '@radix-ui/react-tabs'
import RelatorioFuncionarios from './RelatorioFuncionario'
import CadastroFuncionarios from './CadastroFuncionario'

const Funcionarios = () => {
  return (
    <>
      <Tabs defaultValue="relatorio" className="m-4">
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value="relatorio" className="cursor-pointer">Relatório</TabsTrigger>
          <TabsTrigger value="cadastro" className="cursor-pointer">Cadastro</TabsTrigger>
        </TabsList>
        <TabsContent value="relatorio">
          <RelatorioFuncionarios />
        </TabsContent>
        <TabsContent value="cadastro">
          <CadastroFuncionarios />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default Funcionarios