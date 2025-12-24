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
import { Separator } from "@/components/ui/separator";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockSegments = ["Residencial", "Comercial"];
const mockCategories1 = ["Aquecedores Solares", "Aquecedores a Gás", "Bombas de Calor", "Acessórios"];
const mockCategories2 = ["Baixa Pressão", "Alta Pressão", "Compacto", "Acumulação"];

export function ProductFormModal({ open, onOpenChange }: ProductFormModalProps) {
  // Informações Básicas
  const [segment, setSegment] = useState("");
  const [category1, setCategory1] = useState("");
  const [category2, setCategory2] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");

  // Características Técnicas
  const [thermalCapacity26, setThermalCapacity26] = useState("");
  const [thermalCapacity15, setThermalCapacity15] = useState("");
  const [electricConsumption26, setElectricConsumption26] = useState("");
  const [electricConsumption15, setElectricConsumption15] = useState("");
  const [idealFlowRate, setIdealFlowRate] = useState("");

  // Valores Financeiros
  const [cost, setCost] = useState("");
  const [saleValue, setSaleValue] = useState("");

  const handleSubmit = () => {
    console.log({
      segment,
      category1,
      category2,
      code,
      description,
      proposalDescription,
      thermalCapacity26: parseFloat(thermalCapacity26),
      thermalCapacity15: parseFloat(thermalCapacity15),
      electricConsumption26: parseFloat(electricConsumption26),
      electricConsumption15: parseFloat(electricConsumption15),
      idealFlowRate: parseFloat(idealFlowRate),
      cost: parseFloat(cost),
      saleValue: parseFloat(saleValue),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
          <DialogDescription>
            Cadastre um novo produto com todas as informações técnicas e comerciais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="segment">Segmento *</Label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger id="segment">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSegments.map((seg) => (
                      <SelectItem key={seg} value={seg}>
                        {seg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category1">Categoria 1 *</Label>
                <Select value={category1} onValueChange={setCategory1}>
                  <SelectTrigger id="category1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories1.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category2">Categoria 2 *</Label>
                <Select value={category2} onValueChange={setCategory2}>
                  <SelectTrigger id="category2">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories2.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                placeholder="Ex: AQS-200-BP"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descrição completa do produto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal-description">Descrição para Proposta *</Label>
              <Textarea
                id="proposal-description"
                placeholder="Descrição que aparecerá nas propostas comerciais..."
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Características Técnicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Características Técnicas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thermal-capacity-26">
                  Capacidade Térmica - Condição 26°C (kW) *
                </Label>
                <Input
                  id="thermal-capacity-26"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5.2"
                  value={thermalCapacity26}
                  onChange={(e) => setThermalCapacity26(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thermal-capacity-15">
                  Capacidade Térmica - Condição 15°C (kW) *
                </Label>
                <Input
                  id="thermal-capacity-15"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 4.8"
                  value={thermalCapacity15}
                  onChange={(e) => setThermalCapacity15(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="electric-consumption-26">
                  Consumo Elétrico - Condição 26°C (kWh/h) *
                </Label>
                <Input
                  id="electric-consumption-26"
                  type="number"
                  step="0.001"
                  placeholder="Ex: 1.2"
                  value={electricConsumption26}
                  onChange={(e) => setElectricConsumption26(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="electric-consumption-15">
                  Consumo Elétrico - Condição 15°C (kWh/h) *
                </Label>
                <Input
                  id="electric-consumption-15"
                  type="number"
                  step="0.001"
                  placeholder="Ex: 1.5"
                  value={electricConsumption15}
                  onChange={(e) => setElectricConsumption15(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ideal-flow-rate">
                  Vazão Ideal (m³/h) *
                </Label>
                <Input
                  id="ideal-flow-rate"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 0.8"
                  value={idealFlowRate}
                  onChange={(e) => setIdealFlowRate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Valores Financeiros */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Valores Financeiros</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Custo (R$) *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 1500.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale-value">Valor de Venda (R$) *</Label>
                <Input
                  id="sale-value"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 2500.00"
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Cadastrar Produto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
