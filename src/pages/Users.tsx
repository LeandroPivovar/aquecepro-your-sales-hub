import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserFormModal } from "@/components/modals/UserFormModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockUsers = [
  { id: 1, name: "João Santos", email: "joao.santos@email.com", phone: "(11) 98765-4321", role: "Vendedor", store: "Loja Centro", status: "active", type: "usuario" },
  { id: 2, name: "Ana Costa", email: "ana.costa@email.com", phone: "(11) 98765-4322", role: "Vendedor", store: "Loja Norte", status: "active", type: "usuario" },
  { id: 3, name: "Carlos Silva", email: "carlos.silva@email.com", phone: "(11) 98765-4323", role: "Gerente", store: "Loja Centro", status: "active", type: "usuario" },
  { id: 4, name: "Paula Dias", email: "paula.dias@email.com", phone: "(11) 98765-4324", role: "Vendedor", store: "Loja Sul", status: "active", type: "usuario" },
  { id: 5, name: "Roberto Lima", email: "roberto.lima@email.com", phone: "(11) 98765-4325", role: "Lojista", store: "Loja Norte", status: "inactive", type: "usuario" },
  { id: 6, name: "Maria Oliveira", email: "maria.oliveira@email.com", phone: "(11) 98765-4326", role: "-", store: "-", status: "active", type: "lead" },
  { id: 7, name: "Fernando Costa", email: "fernando.costa@email.com", phone: "(11) 98765-4327", role: "-", store: "-", status: "active", type: "lead" },
  { id: 8, name: "Juliana Santos", email: "juliana.santos@email.com", phone: "(11) 98765-4328", role: "-", store: "Loja Centro", status: "active", type: "cliente" },
  { id: 9, name: "Ricardo Alves", email: "ricardo.alves@email.com", phone: "(11) 98765-4329", role: "-", store: "Loja Sul", status: "active", type: "cliente" },
];

const roleColors: Record<string, string> = {
  Administrador: "bg-destructive/20 text-destructive border-destructive/30",
  Lojista: "bg-secondary/20 text-secondary border-secondary/30",
  Gerente: "bg-warning/20 text-warning border-warning/30",
  Vendedor: "bg-info/20 text-info border-info/30",
};

const typeColors: Record<string, string> = {
  usuario: "bg-primary/20 text-primary border-primary/30",
  lead: "bg-warning/20 text-warning border-warning/30",
  cliente: "bg-success/20 text-success border-success/30",
};

const typeLabels: Record<string, string> = {
  usuario: "Usuário",
  lead: "Lead",
  cliente: "Cliente",
};

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    const matchesType = filterType === "all" || user.type === filterType;
    
    return matchesSearch && matchesRole && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários, leads e clientes do sistema</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="usuario">Usuário</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            <SelectItem value="Administrador">Administrador</SelectItem>
            <SelectItem value="Lojista">Lojista</SelectItem>
            <SelectItem value="Gerente">Gerente</SelectItem>
            <SelectItem value="Vendedor">Vendedor</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[user.type]}>
                      {typeLabels[user.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role !== "-" ? (
                      <Badge variant="outline" className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{user.store}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.status as any} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
