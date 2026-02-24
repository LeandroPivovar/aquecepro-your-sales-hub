import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api, CreateProductRequest, Category } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

// Campos de características por Categoria 2 (chave normalizada)
// Obs: mantido fixo para as abas técnicas até que isso se torne dinâmico no DB
const categories2Fields: Record<string, string[]> = {
  "bomba de calor": [
    "thermalCapacity26",
    "thermalCapacity15",
    "electricConsumption26",
    "electricConsumption15",
    "idealFlowRate",
  ],
  "aquecedor a gas": ["nominalPower", "heaterEfficiency", "gasType"],
  "coletor solar": ["collectorArea", "collectorProduction"],
  reservatorio: ["volume", "resistancePower"],
  reservatório: ["volume", "resistancePower"],
  pressurizador: ["flowAt15mca"],
  "kit pressurizacao indireto": ["simultaneousFlow20C"],
  "bombas de circulacao": [],
  "motobombas": [],
  "controlador digital": [],
  execucao: [],
  execução: [],
  projeto: [],
};

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

  // Campos adicionais de características
  const [volume, setVolume] = useState("");
  const [resistancePower, setResistancePower] = useState("");
  const [collectorArea, setCollectorArea] = useState("");
  const [collectorProduction, setCollectorProduction] = useState("");
  const [nominalPower, setNominalPower] = useState("");
  const [heaterEfficiency, setHeaterEfficiency] = useState("");
  const [gasType, setGasType] = useState("");
  const [flowAt15mca, setFlowAt15mca] = useState("");
  const [simultaneousFlow20C, setSimultaneousFlow20C] = useState("");

  // Valores Financeiros
  const [cost, setCost] = useState("");
  const [saleValue, setSaleValue] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const getCategories1 = () => {
    if (!segment) return [];
    return categories
      .filter((c) => c.type === 'categoria 1' && c.segment === segment)
      .map((c) => c.name);
  };

  const getCategories2 = () => {
    if (!category1) return [];
    const selectedCategory1Obj = categories.find(
      (c) => c.name === category1 && c.type === 'categoria 1' && c.segment === segment
    );
    if (!selectedCategory1Obj) return [];

    return categories
      .filter((c) => c.type === 'categoria 2' && c.parentId === selectedCategory1Obj.id)
      .map((c) => c.name)
      .sort();
  };

  // Limpar categoria1 quando o segmento mudar
  const handleSegmentChange = (newSegment: string) => {
    setSegment(newSegment);
    setCategory1("");
    setCategory2("");
  };

  // Limpar categoria2 quando categoria1 mudar
  const handleCategory1Change = (newCategory1: string) => {
    setCategory1(newCategory1);
    setCategory2(""); // Limpar categoria2 quando categoria1 mudar
  };

  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const getActiveFields = () => {
    if (!category2) return [];
    const key = normalize(category2);
    return categories2Fields[key] || [];
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sucesso!',
        description: 'Produto criado com sucesso',
      });
      onOpenChange(false);
      // Resetar formulário
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setSegment('');
    setCategory1('');
    setCategory2('');
    setCode('');
    setDescription('');
    setProposalDescription('');
    setThermalCapacity26('');
    setThermalCapacity15('');
    setElectricConsumption26('');
    setElectricConsumption15('');
    setIdealFlowRate('');
    setVolume('');
    setResistancePower('');
    setCollectorArea('');
    setCollectorProduction('');
    setNominalPower('');
    setHeaterEfficiency('');
    setGasType('');
    setFlowAt15mca('');
    setSimultaneousFlow20C('');
    setCost('');
    setSaleValue('');
  };

  const handleSubmit = () => {
    if (!segment || !category1 || !category2 || !code || !description || !proposalDescription || !cost || !saleValue) {
      toast({
        title: 'Erro na validação',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const activeFields = getActiveFields();
    const technicalSpecs: Record<string, any> = {};

    // Adicionar apenas os campos ativos ao technicalSpecs
    activeFields.forEach((field) => {
      switch (field) {
        case 'thermalCapacity26':
          if (thermalCapacity26) technicalSpecs.thermalCapacity26 = parseFloat(thermalCapacity26);
          break;
        case 'thermalCapacity15':
          if (thermalCapacity15) technicalSpecs.thermalCapacity15 = parseFloat(thermalCapacity15);
          break;
        case 'electricConsumption26':
          if (electricConsumption26) technicalSpecs.electricConsumption26 = parseFloat(electricConsumption26);
          break;
        case 'electricConsumption15':
          if (electricConsumption15) technicalSpecs.electricConsumption15 = parseFloat(electricConsumption15);
          break;
        case 'idealFlowRate':
          if (idealFlowRate) technicalSpecs.idealFlowRate = parseFloat(idealFlowRate);
          break;
        case 'volume':
          if (volume) technicalSpecs.volume = parseFloat(volume);
          break;
        case 'resistancePower':
          if (resistancePower) technicalSpecs.resistancePower = parseFloat(resistancePower);
          break;
        case 'collectorArea':
          if (collectorArea) technicalSpecs.collectorArea = parseFloat(collectorArea);
          break;
        case 'collectorProduction':
          if (collectorProduction) technicalSpecs.collectorProduction = parseFloat(collectorProduction);
          break;
        case 'nominalPower':
          if (nominalPower) technicalSpecs.nominalPower = parseFloat(nominalPower);
          break;
        case 'heaterEfficiency':
          if (heaterEfficiency) technicalSpecs.heaterEfficiency = parseFloat(heaterEfficiency);
          break;
        case 'gasType':
          if (gasType) technicalSpecs.gasType = gasType;
          break;
        case 'flowAt15mca':
          if (flowAt15mca) technicalSpecs.flowAt15mca = parseFloat(flowAt15mca);
          break;
        case 'simultaneousFlow20C':
          if (simultaneousFlow20C) technicalSpecs.simultaneousFlow20C = parseFloat(simultaneousFlow20C);
          break;
      }
    });

    const productData: CreateProductRequest = {
      code,
      description,
      proposalDescription,
      segment: segment,
      category1,
      category2,
      technicalSpecs: Object.keys(technicalSpecs).length > 0 ? technicalSpecs : undefined,
      cost: parseFloat(cost),
      saleValue: parseFloat(saleValue),
    };

    createMutation.mutate(productData);
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
                <Select value={segment} onValueChange={handleSegmentChange}>
                  <SelectTrigger id="segment">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Piscina">Piscina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category1">Categoria 1 *</Label>
                <Select value={category1} onValueChange={handleCategory1Change} disabled={!segment}>
                  <SelectTrigger id="category1">
                    <SelectValue placeholder={segment ? "Selecione" : "Selecione o segmento primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories1().map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category2">Categoria 2 *</Label>
                <Select value={category2} onValueChange={setCategory2} disabled={!category1}>
                  <SelectTrigger id="category2">
                    <SelectValue placeholder={category1 ? "Selecione" : "Selecione a categoria 1 primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories2().map((cat) => (
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

            {getActiveFields().length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Selecione a Categoria 2 para ver os campos necessários.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {getActiveFields().includes("thermalCapacity26") && (
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
                )}

                {getActiveFields().includes("thermalCapacity15") && (
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
                )}

                {getActiveFields().includes("electricConsumption26") && (
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
                )}

                {getActiveFields().includes("electricConsumption15") && (
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
                )}

                {getActiveFields().includes("idealFlowRate") && (
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
                )}

                {getActiveFields().includes("volume") && (
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (litros)</Label>
                    <Input
                      id="volume"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 200"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("resistancePower") && (
                  <div className="space-y-2">
                    <Label htmlFor="resistance-power">Potência resistência (kW)</Label>
                    <Input
                      id="resistance-power"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 3.0"
                      value={resistancePower}
                      onChange={(e) => setResistancePower(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("collectorArea") && (
                  <div className="space-y-2">
                    <Label htmlFor="collector-area">Área do coletor (m²)</Label>
                    <Input
                      id="collector-area"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 2.5"
                      value={collectorArea}
                      onChange={(e) => setCollectorArea(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("collectorProduction") && (
                  <div className="space-y-2">
                    <Label htmlFor="collector-production">Produção média do coletor PMDEE (kWh/m².dia)</Label>
                    <Input
                      id="collector-production"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 4.2"
                      value={collectorProduction}
                      onChange={(e) => setCollectorProduction(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("nominalPower") && (
                  <div className="space-y-2">
                    <Label htmlFor="nominal-power">Potência nominal (kcal/h)</Label>
                    <Input
                      id="nominal-power"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 30000"
                      value={nominalPower}
                      onChange={(e) => setNominalPower(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("heaterEfficiency") && (
                  <div className="space-y-2">
                    <Label htmlFor="heater-efficiency">Eficiência aquecedor (%)</Label>
                    <Input
                      id="heater-efficiency"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 92"
                      value={heaterEfficiency}
                      onChange={(e) => setHeaterEfficiency(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("gasType") && (
                  <div className="space-y-2">
                    <Label htmlFor="gas-type">Tipo do gás</Label>
                    <Input
                      id="gas-type"
                      placeholder="Ex: GLP / GN"
                      value={gasType}
                      onChange={(e) => setGasType(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("flowAt15mca") && (
                  <div className="space-y-2">
                    <Label htmlFor="flow-15mca">Vazão c/ pressão de 15mca (litros/min)</Label>
                    <Input
                      id="flow-15mca"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 12"
                      value={flowAt15mca}
                      onChange={(e) => setFlowAt15mca(e.target.value)}
                    />
                  </div>
                )}

                {getActiveFields().includes("simultaneousFlow20C") && (
                  <div className="space-y-2">
                    <Label htmlFor="flow-20c">
                      Vazão simultânea com capacidade de elevação temperatura 20°C
                    </Label>
                    <Input
                      id="flow-20c"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 10"
                      value={simultaneousFlow20C}
                      onChange={(e) => setSimultaneousFlow20C(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar Produto'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
