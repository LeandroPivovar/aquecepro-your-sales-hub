import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api, Proposal } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface ProposalPaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    proposal: Proposal | null;
}

export function ProposalPaymentModal({ open, onOpenChange, proposal }: ProposalPaymentModalProps) {
    const queryClient = useQueryClient();

    const [value, setValue] = useState("");
    const [allowsInstallments, setAllowsInstallments] = useState(false);
    const [maxInstallments, setMaxInstallments] = useState("");
    const [hasInterest, setHasInterest] = useState(false);
    const [interestFreeInstallments, setInterestFreeInstallments] = useState("");

    // Load existing data when modal opens
    useEffect(() => {
        if (proposal && open) {
            const { data } = proposal;
            setValue(data?.value?.toString() || "");

            const paymentConditions = data?.paymentConditions;
            if (paymentConditions) {
                setAllowsInstallments(paymentConditions.allowsInstallments || false);
                setMaxInstallments(paymentConditions.maxInstallments?.toString() || "");
                setHasInterest(paymentConditions.hasInterest || false);
                setInterestFreeInstallments(paymentConditions.interestFreeInstallments?.toString() || "");
            } else {
                setAllowsInstallments(false);
                setMaxInstallments("");
                setHasInterest(false);
                setInterestFreeInstallments("");
            }
        } else if (!open) {
            // Reset when closed
            setValue("");
            setAllowsInstallments(false);
            setMaxInstallments("");
            setHasInterest(false);
            setInterestFreeInstallments("");
        }
    }, [proposal, open]);

    const updateProposalMutation = useMutation({
        mutationFn: async (updatedData: any) => {
            if (!proposal?.id) throw new Error("ID da proposta não encontrado");
            return api.updateProposal(proposal.id, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proposals'] });
            toast({
                title: "Sucesso!",
                description: "Valores da proposta atualizados com sucesso.",
            });
            onOpenChange(false);
        },
        onError: (error) => {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Erro ao atualizar proposta",
                variant: "destructive",
            });
        },
    });

    const handleSave = () => {
        if (!proposal) return;

        // Build the updated data object
        const updatedData = {
            data: {
                ...(proposal.data || {}),
                value: value ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : 0, // Quick conversion for Brazilian format, you could enhance it
                paymentConditions: {
                    allowsInstallments,
                    maxInstallments: maxInstallments ? parseInt(maxInstallments, 10) : 0,
                    hasInterest,
                    interestFreeInstallments: interestFreeInstallments ? parseInt(interestFreeInstallments, 10) : 0,
                }
            }
        };

        // Quick format conversion from R$ if user typed it
        if (value && value.includes(',')) {
            updatedData.data.value = parseFloat(value.replace(/\./g, "").replace(",", "."));
        } else if (value) {
            updatedData.data.value = parseFloat(value);
        }

        updateProposalMutation.mutate(updatedData);
    };

    // Format currency helper to display in input
    const formatCurrency = (val: string) => {
        let rawValue = val.replace(/\D/g, "");
        if (!rawValue) return "";
        rawValue = (parseInt(rawValue, 10) / 100).toFixed(2);
        return rawValue.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(formatCurrency(e.target.value));
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Valor da Proposta</DialogTitle>
                    <DialogDescription>
                        Defina o valor e as condições de pagamento que serão exibidos no PDF.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="value">Valor Total (R$)</Label>
                        <Input
                            id="value"
                            placeholder="0,00"
                            value={value}
                            onChange={handleValueChange}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t mt-2">
                        <Checkbox
                            id="allowsInstallments"
                            checked={allowsInstallments}
                            onCheckedChange={(checked) => setAllowsInstallments(checked === true)}
                        />
                        <Label htmlFor="allowsInstallments" className="font-medium cursor-pointer">
                            Permite Parcelamento?
                        </Label>
                    </div>

                    {allowsInstallments && (
                        <div className="grid gap-4 pl-6 pt-2 pb-2 rounded-md bg-muted/30">
                            <div className="grid gap-2">
                                <Label htmlFor="maxInstallments">Número MÁXIMO de Parcelas</Label>
                                <Input
                                    id="maxInstallments"
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 12"
                                    value={maxInstallments}
                                    onChange={(e) => setMaxInstallments(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2 mt-2">
                                <Checkbox
                                    id="hasInterest"
                                    checked={hasInterest}
                                    onCheckedChange={(checked) => setHasInterest(checked === true)}
                                />
                                <Label htmlFor="hasInterest" className="cursor-pointer">
                                    Parcelamento com Juros?
                                </Label>
                            </div>

                            {hasInterest && (
                                <div className="grid gap-2">
                                    <Label htmlFor="interestFreeInstallments">Até quantas parcelas SEM juros?</Label>
                                    <Input
                                        id="interestFreeInstallments"
                                        type="number"
                                        min="1"
                                        placeholder="Ex: 3"
                                        value={interestFreeInstallments}
                                        onChange={(e) => setInterestFreeInstallments(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Ex: Se for em 12x reais, mas até 3x não tem juros, coloque 3.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateProposalMutation.isPending}
                    >
                        {updateProposalMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
