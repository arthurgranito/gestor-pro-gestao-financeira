import React from 'react'
import { Button } from '../ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const Paginacao = ({ paginaAtual, totalPaginas, onPageChange }) => {
    const renderPages = () => {
        const maxVisible = 3; // Quantidade máxima de páginas visíveis
        let startPage, endPage;

        // Se o total de páginas for pequeno o suficiente, mostramos todas as páginas
        if (totalPaginas <= maxVisible) {
            startPage = 1;
            endPage = totalPaginas;
        } else {
            // Se estivermos perto do início
            if (paginaAtual <= maxVisible) {
                startPage = 1;
                endPage = maxVisible;
            }
            // Se estivermos perto do fim
            else if (paginaAtual + maxVisible - 1 >= totalPaginas) {
                startPage = totalPaginas - maxVisible + 1;
                endPage = totalPaginas;
            }
            // Caso normal, páginas intermediárias
            else {
                startPage = paginaAtual - 1;
                endPage = paginaAtual + 1;
            }
        }

        let pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <>
            <div className="flex justify-center mt-4 gap-2 flex-wrap">
                <Button
                    onClick={() => onPageChange(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="h-9 w-9 cursor-pointer"
                    variant="secondary"
                >
                    <ArrowLeft />
                </Button>

                {renderPages().map((pagina) => (
                    <Button
                        key={pagina}
                        onClick={() => onPageChange(pagina)}
                        className="h-9 w-9 cursor-pointer"
                        variant={paginaAtual === pagina ? '' : 'outline'}
                    >
                        {pagina}
                    </Button>
                ))}

                {totalPaginas > 3 && paginaAtual + 1 < totalPaginas && (
                    <Button
                        onClick={() => onPageChange(paginaAtual + 1)}
                        className="h-9 w-9 cursor-pointer"
                        variant="outline"
                    >
                        ...
                    </Button>
                )}

                <Button
                    onClick={() => onPageChange(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="h-9 w-9 cursor-pointer"
                    variant="secondary"
                >
                    <ArrowRight />
                </Button>
            </div>
        </>
    )
}

export default Paginacao