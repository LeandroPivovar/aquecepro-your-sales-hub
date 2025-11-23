import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Store as StoreIcon } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";

const mockStores = [
  { id: 1, name: "Loja Centro", city: "São Paulo", address: "Av. Paulista, 1000", phone: "(11) 3333-4444", manager: "Carlos Silva", products: 45, status: "active" },
  { id: 2, name: "Loja Norte", city: "São Paulo", address: "Rua das Flores, 500", phone: "(11) 3333-5555", manager: "Maria Santos", products: 38, status: "active" },
  { id: 3, name: "Loja Sul", city: "Campinas", address: "Av. Brasil, 2000", phone: "(19) 3333-6666", manager: "João Costa", products: 42, status: "active" },
];

export default function Stores() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lojas</h1>
          <p className="text-muted-foreground">Gerencie as lojas da rede</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Loja
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Gerente</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <StoreIcon className="h-4 w-4 text-primary" />
                    </div>
                    {store.name}
                  </div>
                </TableCell>
                <TableCell>{store.city}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>{store.phone}</TableCell>
                <TableCell>{store.manager}</TableCell>
                <TableCell>{store.products}</TableCell>
                <TableCell>
                  <StatusBadge status={store.status as any} />
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
    </div>
  );
}
