import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Edit, Trash2, Search, Loader2 } from "lucide-react";
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
import { api, User } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  seller: "Vendedor",
  user: "Usuário",
};

const roleColors: Record<string, string> = {
  admin: "bg-destructive/20 text-destructive border-destructive/30",
  manager: "bg-warning/20 text-warning border-warning/30",
  seller: "bg-info/20 text-info border-info/30",
  user: "bg-secondary/20 text-secondary border-secondary/30",
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Sucesso!',
        description: 'Usuário removido com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? user.isActive : !user.isActive);
    const matchesType = filterType === "all" || user.type === filterType;
    
    return matchesSearch && matchesRole && matchesStatus && matchesType;
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários, leads e clientes do sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários, leads e clientes do sistema</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar usuários</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários, leads e clientes do sistema</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
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
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="seller">Vendedor</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
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
                  {users.length === 0 
                    ? "Nenhum usuário cadastrado. Clique em 'Novo Usuário' para começar."
                    : "Nenhum registro encontrado com os filtros aplicados"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[user.type]}>
                      {typeLabels[user.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.storeName || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={user.isActive ? 'active' : 'inactive' as any} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        user={editingUser}
      />
    </div>
  );
}
