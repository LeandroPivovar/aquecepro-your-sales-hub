import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Plus, Search, MoreVertical, Download, Calendar, Edit, Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProposalFormModal } from "@/components/modals/ProposalFormModal";
import { AppointmentFormModal } from "@/components/modals/AppointmentFormModal";
import { api, Proposal, Appointment } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { generateProposalPDF } from "@/utils/generateProposalPDF";

export default function Proposals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentFromProposal, setAppointmentFromProposal] = useState<Partial<Pick<Appointment, 'clientId' | 'address'>> | null>(null);
  const queryClient = useQueryClient();

  const { data: proposals = [], isLoading, error } = useQuery<Proposal[]>({
    queryKey: ['proposals'],
    queryFn: () => api.getProposals(),
  });

  // Filtrar propostas
  const filteredProposals = useMemo(() => {
    let filtered = proposals;

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((proposal) => proposal.status === statusFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((proposal) => {
        const clientName = proposal.clientName?.toLowerCase() || "";
        const id = proposal.id.toLowerCase();
        const segment = proposal.segment.toLowerCase();
        return (
          clientName.includes(searchLower) ||
          id.includes(searchLower) ||
          segment.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [proposals, statusFilter, searchTerm]);

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar segmento
  const formatSegment = (segment: string) => {
    return segment === "piscina" ? "Piscina" : "Residencial";
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Propostas</h1>
            <p className="text-muted-foreground">Gerencie todas as propostas comerciais</p>
          </div>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Button>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-destructive mb-4">Erro ao carregar propostas.</p>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['proposals'] })}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Propostas</h1>
          <p className="text-muted-foreground">Gerencie todas as propostas comerciais</p>
        </div>
        <Button 
          className="gap-2" 
          onClick={() => {
            setEditingProposal(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova Proposta
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, ID ou vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="scheduled">Agendado</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Segmentação</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando propostas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {proposals.length === 0 
                    ? "Nenhuma proposta encontrada. Crie uma nova proposta para começar."
                    : "Nenhuma proposta encontrada com os filtros aplicados."}
                </TableCell>
              </TableRow>
            ) : (
              filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">
                    #{proposal.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      proposal.segment === "piscina" 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    }`}>
                      {formatSegment(proposal.segment)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {proposal.clientName || proposal.clientId || "Cliente não informado"}
                  </TableCell>
                  <TableCell>
                    {proposal.city || "-"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {/* Valor pode ser calculado dos produtos selecionados */}
                    -
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={proposal.status as any} />
                  </TableCell>
                  <TableCell>
                    {/* Vendedor pode vir do userId */}
                    -
                  </TableCell>
                  <TableCell>{formatDate(proposal.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              // Buscar a proposta completa
                              const fullProposal = await api.getProposal(proposal.id);
                              setEditingProposal(fullProposal);
                              setIsModalOpen(true);
                            } catch (error) {
                              toast({
                                title: 'Erro',
                                description: error instanceof Error ? error.message : 'Erro ao carregar proposta',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              // Buscar a proposta completa se necessário
                              const fullProposal = await api.getProposal(proposal.id);
                              await generateProposalPDF({ proposal: fullProposal });
                              toast({
                                title: 'Sucesso!',
                                description: 'PDF gerado com sucesso',
                              });
                            } catch (error) {
                              toast({
                                title: 'Erro',
                                description: error instanceof Error ? error.message : 'Erro ao gerar PDF',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Proposta (PDF)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              // Buscar a proposta completa se necessário
                              const fullProposal = await api.getProposal(proposal.id);
                              
                              // Preparar dados do agendamento baseado na proposta
                              const clientId = fullProposal.clientId;
                              const address = fullProposal.city || "Endereço não informado";
                              
                              // Criar objeto de agendamento pré-preenchido
                              const appointmentData: Partial<Pick<Appointment, 'clientId' | 'address'>> = {
                                clientId: clientId || undefined,
                                address: address,
                              };
                              
                              setAppointmentFromProposal(appointmentData);
                              setIsAppointmentModalOpen(true);
                            } catch (error) {
                              toast({
                                title: 'Erro',
                                description: error instanceof Error ? error.message : 'Erro ao preparar agendamento',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Agendar
                        </DropdownMenuItem>
                        {proposal.status !== 'approved' && proposal.status !== 'completed' && (
                          <DropdownMenuItem
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja fechar esta proposta? A proposta deve ter um agendamento relacionado.')) {
                                try {
                                  await api.closeProposal(proposal.id);
                                  queryClient.invalidateQueries({ queryKey: ['proposals'] });
                                  toast({
                                    title: 'Sucesso!',
                                    description: 'Proposta fechada com sucesso',
                                  });
                                } catch (error) {
                                  toast({
                                    title: 'Erro',
                                    description: error instanceof Error ? error.message : 'Erro ao fechar proposta',
                                    variant: 'destructive',
                                  });
                                }
                              }
                            }}
                            disabled={proposal.status === 'cancelled'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Fechar Proposta
                          </DropdownMenuItem>
                        )}
                        {proposal.status !== 'cancelled' && (
                          <DropdownMenuItem
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja cancelar esta proposta?')) {
                                try {
                                  await api.cancelProposal(proposal.id);
                                  queryClient.invalidateQueries({ queryKey: ['proposals'] });
                                  toast({
                                    title: 'Sucesso!',
                                    description: 'Proposta cancelada com sucesso',
                                  });
                                } catch (error) {
                                  toast({
                                    title: 'Erro',
                                    description: error instanceof Error ? error.message : 'Erro ao cancelar proposta',
                                    variant: 'destructive',
                                  });
                                }
                              }
                            }}
                            disabled={proposal.status === 'approved' || proposal.status === 'completed'}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar Proposta
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProposalFormModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingProposal(null);
            // Recarregar propostas quando o modal fechar
            queryClient.invalidateQueries({ queryKey: ['proposals'] });
          }
        }}
        proposal={editingProposal || undefined}
      />

      <AppointmentFormModal
        open={isAppointmentModalOpen}
        onOpenChange={(open) => {
          setIsAppointmentModalOpen(open);
          if (!open) {
            setAppointmentFromProposal(null);
          }
        }}
        initialData={appointmentFromProposal || undefined}
      />
    </div>
  );
}
