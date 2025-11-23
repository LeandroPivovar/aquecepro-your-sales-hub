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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserFormModal } from "@/components/modals/UserFormModal";

const mockUsers = [
  { id: 1, name: "João Santos", email: "joao.santos@email.com", phone: "(11) 98765-4321", role: "Vendedor", store: "Loja Centro", status: "active" },
  { id: 2, name: "Ana Costa", email: "ana.costa@email.com", phone: "(11) 98765-4322", role: "Vendedor", store: "Loja Norte", status: "active" },
  { id: 3, name: "Carlos Silva", email: "carlos.silva@email.com", phone: "(11) 98765-4323", role: "Gerente", store: "Loja Centro", status: "active" },
  { id: 4, name: "Paula Dias", email: "paula.dias@email.com", phone: "(11) 98765-4324", role: "Vendedor", store: "Loja Sul", status: "active" },
  { id: 5, name: "Roberto Lima", email: "roberto.lima@email.com", phone: "(11) 98765-4325", role: "Lojista", store: "Loja Norte", status: "inactive" },
];

const roleColors: Record<string, string> = {
  Administrador: "bg-destructive/20 text-destructive border-destructive/30",
  Lojista: "bg-secondary/20 text-secondary border-secondary/30",
  Gerente: "bg-warning/20 text-warning border-warning/30",
  Vendedor: "bg-info/20 text-info border-info/30",
};

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleColors[user.role]}>
                    {user.role}
                  </Badge>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
