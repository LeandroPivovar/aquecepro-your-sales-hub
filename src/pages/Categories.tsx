import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";

const mockCategories = [
  { id: 1, name: "Aquecedores Solares", description: "Sistemas completos de aquecimento solar", products: 12, status: "active" },
  { id: 2, name: "Aquecedores a Gás", description: "Aquecedores de passagem e acumulação", products: 8, status: "active" },
  { id: 3, name: "Coletores", description: "Coletores solares e placas", products: 6, status: "active" },
  { id: 4, name: "Boilers", description: "Reservatórios térmicos", products: 5, status: "active" },
  { id: 5, name: "Acessórios", description: "Controladores, sensores e acessórios", products: 14, status: "active" },
];

export default function Categories() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Organize os produtos em categorias</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.products}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={category.status as any} />
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
