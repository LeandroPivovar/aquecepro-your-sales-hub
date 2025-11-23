import { useState } from "react";
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
import { Plus, Search, MoreVertical, Download, Calendar, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProposalFormModal } from "@/components/modals/ProposalFormModal";

const mockProposals = [
  { id: "001", lead: "Maria Silva", store: "Loja Centro", value: "R$ 12.500,00", status: "pending", seller: "João Santos", date: "2024-01-10" },
  { id: "002", lead: "Carlos Souza", store: "Loja Norte", value: "R$ 8.900,00", status: "approved", seller: "Ana Costa", date: "2024-01-12" },
  { id: "003", lead: "Pedro Lima", store: "Loja Sul", value: "R$ 15.200,00", status: "scheduled", seller: "João Santos", date: "2024-01-13" },
  { id: "004", lead: "Juliana Rocha", store: "Loja Centro", value: "R$ 10.800,00", status: "completed", seller: "Paula Dias", date: "2024-01-14" },
  { id: "005", lead: "Roberto Costa", store: "Loja Norte", value: "R$ 7.500,00", status: "cancelled", seller: "Roberto Silva", date: "2024-01-14" },
];

export default function Proposals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            {mockProposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell className="font-medium">#{proposal.id}</TableCell>
                <TableCell>{proposal.lead}</TableCell>
                <TableCell>{proposal.store}</TableCell>
                <TableCell className="font-medium">{proposal.value}</TableCell>
                <TableCell>
                  <StatusBadge status={proposal.status as any} />
                </TableCell>
                <TableCell>{proposal.seller}</TableCell>
                <TableCell>{proposal.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Proposta
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProposalFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
