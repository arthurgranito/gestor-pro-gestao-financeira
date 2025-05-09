import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function Cadastro() {
    const [nome, setNome] = useState('');
    const [cargo, setCargo] = useState('');
    const [setor, setSetor] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [setores, setSetores] = useState([]);
    const [cargos, setCargos] = useState([])

    useEffect(() => {
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

        fetchSetores();
        fetchCargos();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const docRef = await addDoc(collection(db, 'funcionarios'), {
                nome: nome,
                saldoTotal: 0,
                cargo: cargo,
                setor: setor,
            });
            console.log('Funcionário cadastrado com ID: ', docRef.id);
            setSuccessMessage('Funcionário cadastrado com sucesso!');
            setNome('');
            setCargo('');
            setSetor('');
        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            setErrorMessage('Erro ao cadastrar funcionário. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cadastro de Funcionário</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nome" className="mb-2">Nome</Label>
                        <Input
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="cargo" className="mb-2">Cargo</Label>
                        <Select value={cargo} onValueChange={setCargo}>
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
                    <div>
                        <Label htmlFor="setor" className="mb-2">Setor</Label>
                        <Select value={setor} onValueChange={setSetor}>
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
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                </form>
                {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
                {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            </CardContent>
        </Card>
    );
}

export default Cadastro;