import React from 'react'
import { Button } from '../ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const Paginacao = ({ paginaAtual, totalPaginas, onPageChange }) => {
    return (
        <>
            <div className='flex justify-center mt-4 gap-2 flex-wrap'>
                <Button onClick={() => onPageChange(paginaAtual - 1)} disabled={paginaAtual === 1} className="h-9 w-9" variant="secondary">
                    <ArrowLeft />
                </Button>

                {[...Array(totalPaginas)].map((_, index) => {
                    const pagina = index + 1;
                    return (
                        <Button key={pagina} onClick={() => onPageChange(pagina)} className="h-9 w-9" variant={paginaAtual === pagina ? '' : 'outline'}>
                            {pagina}
                        </Button>
                    )
                })}

                <Button onClick={() => onPageChange(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className="h-9 w-9" variant="secondary">
                    <ArrowRight />
                </Button>
            </div>
        </>
    )
}

export default Paginacao