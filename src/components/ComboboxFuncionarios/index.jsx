import { useState } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FuncionarioCombobox({ value, onChange, funcionarios }) {
    const [open, setOpen] = useState(false);
    const selectedFuncionario = funcionarios.find((f) => f.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between text-left font-medium",
                        !selectedFuncionario && "text-muted-foreground"
                    )}
                >
                    {selectedFuncionario?.nome || "Selecione o funcionário"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput
                        placeholder="Pesquisar..."
                        className="h-10 text-sm px-3"
                    />
                    <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                        {funcionarios.map((func) => (
                            <CommandItem
                                key={func.id}
                                value={func.nome}
                                onSelect={(currentValue) => {
                                    const selected = funcionarios.find(f => f.nome === currentValue);
                                    if (selected) {
                                        onChange(selected.id);
                                    } 
                                    setOpen(false);
                                }}
                                className="cursor-pointer text-sm px-3 py-2 hover:bg-emerald-100"
                            >
                                {func.nome}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default FuncionarioCombobox;
