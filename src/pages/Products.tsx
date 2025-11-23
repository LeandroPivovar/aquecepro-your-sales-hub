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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductFormModal } from "@/components/modals/ProductFormModal";

const mockProducts = [
  { id: 1, name: "Aquecedor Solar 200L", sku: "AQS-200", category: "Aquecedores Solares", price: "R$ 2.500,00", stores: 3 },
  { id: 2, name: "Aquecedor a Gás 15L", sku: "AQG-15", category: "Aquecedores a Gás", price: "R$ 1.200,00", stores: 3 },
  { id: 3, name: "Coletor Solar Premium", sku: "COL-PRM", category: "Coletores", price: "R$ 800,00", stores: 2 },
  { id: 4, name: "Boiler Inox 300L", sku: "BOI-300", category: "Boilers", price: "R$ 1.800,00", stores: 3 },
  { id: 5, name: "Controlador Digital", sku: "CTL-DIG", category: "Acessórios", price: "R$ 350,00", stores: 3 },
];

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Disponível em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-xs">{product.sku}</code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-secondary/20 text-secondary border-secondary/30">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{product.price}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.stores} lojas</Badge>
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

      <ProductFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
