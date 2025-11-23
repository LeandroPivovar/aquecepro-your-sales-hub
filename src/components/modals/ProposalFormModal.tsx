import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Calendar } from "lucide-react";

interface ProposalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockStores = ["Loja Centro", "Loja Norte", "Loja Sul"];
const mockLeads = ["Maria Silva", "Carlos Souza", "Pedro Lima", "Juliana Rocha"];
const mockProducts = [
  { id: 1, name: "Aquecedor Solar 200L", price: 2500 },
  { id: 2, name: "Aquecedor a Gás 15L", price: 1200 },
  { id: 3, name: "Coletor Solar Premium", price: 800 },
  { id: 4, name: "Boiler Inox 300L", price: 1800 },
];

interface ProductItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export function ProposalFormModal({ open, onOpenChange }: ProposalFormModalProps) {
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedLead, setSelectedLead] = useState("");
  const [newLead, setNewLead] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [extrasValue, setExtrasValue] = useState(0);
  const [extrasDescription, setExtrasDescription] = useState("");

  const addProduct = (productId: string) => {
    const product = mockProducts.find((p) => p.id === parseInt(productId));
    if (product && !selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, quantity: 1, total: product.price },
      ]);
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.id === id ? { ...p, quantity, total: p.price * quantity } : p
      )
    );
  };

  const removeProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
  };

  const subtotal = selectedProducts.reduce((sum, p) => sum + p.total, 0);
  const total = subtotal + extrasValue;

  const handleSubmit = () => {
    console.log({
      store: selectedStore,
      lead: selectedLead || newLead,
      products: selectedProducts,
      extras: { value: extrasValue, description: extrasDescription },
      total,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Proposta</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova proposta comercial
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="store">Loja *</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger id="store">
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  {mockStores.map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lead / Cliente *</Label>
              <Select value={selectedLead} onValueChange={setSelectedLead}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lead existente" />
                </SelectTrigger>
                <SelectContent>
                  {mockLeads.map((lead) => (
                    <SelectItem key={lead} value={lead}>
                      {lead}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">ou</div>
              <Input
                placeholder="Digite o nome do novo lead"
                value={newLead}
                onChange={(e) => setNewLead(e.target.value)}
                disabled={!!selectedLead}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Produtos</Label>
              <Select onValueChange={addProduct}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Adicionar produto" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - R$ {product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProducts.length > 0 && (
              <div className="space-y-2 rounded-lg border p-4">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {product.price.toFixed(2)} / unidade
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Qtd:</Label>
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          updateQuantity(product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-20"
                      />
                    </div>
                    <div className="w-32 text-right font-medium">
                      R$ {product.total.toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <Label>Serviços Extras (Opcional)</Label>
            <Textarea
              placeholder="Descrição dos serviços extras..."
              value={extrasDescription}
              onChange={(e) => setExtrasDescription(e.target.value)}
            />
            <div className="space-y-2">
              <Label htmlFor="extras-value">Valor dos Extras</Label>
              <Input
                id="extras-value"
                type="number"
                min="0"
                step="0.01"
                value={extrasValue}
                onChange={(e) => setExtrasValue(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal (Produtos):</span>
              <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Extras:</span>
              <span className="font-medium">R$ {extrasValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={handleSubmit}>
            <Calendar className="mr-2 h-4 w-4" />
            Gerar Agendamento
          </Button>
          <Button onClick={handleSubmit}>Salvar Proposta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
