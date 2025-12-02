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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Waves, Home, ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";

interface ProposalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockCities = [
  { city: "São Paulo", state: "SP" },
  { city: "Campinas", state: "SP" },
  { city: "Santos", state: "SP" },
  { city: "Rio de Janeiro", state: "RJ" },
];

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const coldMonths = ["Maio", "Junho", "Julho", "Agosto"];
const warmMonths = ["Janeiro", "Fevereiro", "Março", "Abril", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Máquinas - Período Frio (Maio a Agosto) - Teste 26°C
const machinesCold = [
  { model: "KDBC 025QC", capacity: 7.68, flow: 2.5 },
  { model: "KDBC 045QC", capacity: 13.18, flow: 4.5 },
  { model: "KDBC 060QC", capacity: 16.41, flow: 6.5 },
  { model: "KDBC 075QC", capacity: 21.30, flow: 6.5 },
  { model: "KDBC 100QC", capacity: 28.13, flow: 9.0 },
  { model: "KDBC 120QC", capacity: 34.58, flow: 10.0 },
];

// Máquinas - Período Quente - Teste 15°C
const machinesWarm = [
  { model: "KDBC 025QC", capacity: 5.83, flow: 2.5 },
  { model: "KDBC 045QC", capacity: 9.67, flow: 4.5 },
  { model: "KDBC 060QC", capacity: 12.50, flow: 6.5 },
  { model: "KDBC 075QC", capacity: 15.82, flow: 6.5 },
  { model: "KDBC 100QC", capacity: 20.59, flow: 9.0 },
  { model: "KDBC 120QC", capacity: 23.44, flow: 10.0 },
];

interface PoolArea {
  id: number;
  length: string;
  width: string;
  depth: string;
}

interface MachineSelection {
  model: string;
  quantity: number;
  capacity: number;
  flow: number;
}

export function ProposalFormModal({ open, onOpenChange }: ProposalFormModalProps) {
  // Segmentação e etapas
  const [segment, setSegment] = useState<"piscina" | "residencial" | null>(null);
  const [step, setStep] = useState(1);

  // Passo 1: Local de Instalação
  const [selectedCity, setSelectedCity] = useState("");

  // Passo 2: Meses de Utilização
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Passo 3: Configurações de Uso
  const [useFrequency, setUseFrequency] = useState("");
  const [desiredTemp, setDesiredTemp] = useState("");

  // Passo 4: Tipo de Ambiente
  const [isEnclosed, setIsEnclosed] = useState(false);
  const [enclosedArea, setEnclosedArea] = useState("");
  const [poolSurfaceArea, setPoolSurfaceArea] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);

  // Passo 5: Áreas da Piscina
  const [poolAreas, setPoolAreas] = useState<PoolArea[]>([
    { id: 1, length: "", width: "", depth: "" }
  ]);

  // Passo 6: Características Especiais
  const [hasWaterfall, setHasWaterfall] = useState(false);
  const [waterfallHeight, setWaterfallHeight] = useState("");
  const [waterfallWidth, setWaterfallWidth] = useState("");
  const [hasInfinityEdge, setHasInfinityEdge] = useState(false);
  const [infinityLength, setInfinityLength] = useState("");
  const [infinityHeight, setInfinityHeight] = useState("");
  const [infinityWidth, setInfinityWidth] = useState("");

  // Passo 7: Resultados e Seleção de Máquinas
  const [suggestedMachines, setSuggestedMachines] = useState<MachineSelection[]>([]);
  const [selectedMachines, setSelectedMachines] = useState<MachineSelection[]>([]);
  const [thermalLoad, setThermalLoad] = useState(0);
  const [heatingTime, setHeatingTime] = useState(0);
  const [energyConsumption, setEnergyConsumption] = useState({ initial: 0, daily: 0 });

  // Funções de cálculo
  const getWindFactor = (windSpeed: number) => {
    if (windSpeed <= 18) return 1.15;
    if (windSpeed <= 35) return 1.25;
    if (windSpeed <= 44) return 1.80;
    return 1.80;
  };

  const getTempFactor = (temp: number, heatingTime: number) => {
    if (temp > 31 && heatingTime > 55) {
      return 1 + (temp - 31) * 0.15;
    }
    return 1;
  };

  const getSuspendedFactor = () => isSuspended ? 1.5 : 1;

  const getEnclosedFactor = () => isEnclosed ? 1.15 : 1;

  const calculateThermalCapacity = (
    length: number,
    width: number,
    depth: number,
    desiredTemp: number,
    minTemp: number,
    windFactor: number,
    tempFactor: number,
    suspendedFactor: number,
    heatingTime: number,
    isShallow: boolean
  ) => {
    const tempDiff = desiredTemp - minTemp;
    
    if (isShallow) {
      // Cálculo por área (profundidade <= 0.6m, cascatas, bordas infinitas)
      return (length * width * 0.06 * tempDiff * windFactor * tempFactor * suspendedFactor) / heatingTime;
    } else {
      // Cálculo por volume (profundidade > 0.6m)
      return (length * width * depth * 1000 * tempDiff * windFactor * tempFactor * suspendedFactor * 4.18) / (3600 * heatingTime);
    }
  };

  const suggestMachines = (totalCapacity: number) => {
    // Determinar período (frio ou quente) baseado nos meses selecionados
    const hasColdMonths = selectedMonths.some(m => coldMonths.includes(m));
    const machines = hasColdMonths ? machinesCold : machinesWarm;

    // Encontrar máquina mais próxima
    let bestMachine = machines[machines.length - 1]; // Maior máquina por padrão
    let minDiff = Math.abs(totalCapacity - bestMachine.capacity);

    for (const machine of machines) {
      const diff = Math.abs(totalCapacity - machine.capacity);
      if (diff < minDiff) {
        minDiff = diff;
        bestMachine = machine;
      }
    }

    // Se precisar de múltiplas máquinas
    const quantity = Math.ceil(totalCapacity / bestMachine.capacity);

    return [{
      model: bestMachine.model,
      quantity,
      capacity: bestMachine.capacity,
      flow: bestMachine.flow,
    }];
  };

  const calculateResults = () => {
    // Simular cálculos (em produção, usar dados reais da NASA)
    const minTemp = 15; // Temperatura mínima simulada
    const windSpeed = 20; // Velocidade do vento simulada
    const heatingHours = useFrequency === "diario" ? 65 : 24;

    const windFactor = getWindFactor(windSpeed);
    const tempFactor = getTempFactor(parseFloat(desiredTemp), heatingHours);
    const suspendedFactor = getSuspendedFactor();
    const enclosedFactor = getEnclosedFactor();

    let totalCapacity = 0;

    // Calcular para cada área
    poolAreas.forEach(area => {
      const length = parseFloat(area.length) || 0;
      const width = parseFloat(area.width) || 0;
      const depth = parseFloat(area.depth) || 0;
      
      if (length && width && depth) {
        const isShallow = depth <= 0.6;
        const capacity = calculateThermalCapacity(
          length, width, depth,
          parseFloat(desiredTemp), minTemp,
          windFactor, tempFactor, suspendedFactor,
          heatingHours, isShallow
        );
        totalCapacity += capacity;
      }
    });

    // Calcular cascata
    if (hasWaterfall && waterfallHeight && waterfallWidth) {
      const capacity = calculateThermalCapacity(
        parseFloat(waterfallWidth), parseFloat(waterfallHeight), 0.06,
        parseFloat(desiredTemp), minTemp,
        windFactor, tempFactor, suspendedFactor,
        heatingHours, true
      );
      totalCapacity += capacity;
    }

    // Calcular borda infinita
    if (hasInfinityEdge && infinityLength && infinityHeight && infinityWidth) {
      const capacity = calculateThermalCapacity(
        parseFloat(infinityLength), parseFloat(infinityWidth), 0.06,
        parseFloat(desiredTemp), minTemp,
        windFactor, tempFactor, suspendedFactor,
        heatingHours, true
      );
      totalCapacity += capacity;
    }

    // Aplicar fator de local fechado
    totalCapacity *= enclosedFactor;

    setThermalLoad(totalCapacity);

    // Sugerir máquinas
    const suggested = suggestMachines(totalCapacity);
    setSuggestedMachines(suggested);
    setSelectedMachines(suggested);
    setHeatingTime(heatingHours);
  };

  const recalculateWithSelectedMachines = () => {
    const totalMachineCapacity = selectedMachines.reduce(
      (sum, m) => sum + (m.capacity * m.quantity), 0
    );

    // Novo tempo de aquecimento
    const newHeatingTime = thermalLoad / totalMachineCapacity;
    setHeatingTime(newHeatingTime);

    // Consumo elétrico (simulado - em produção usar dados reais da máquina)
    const electricPower = 5; // kW simulado por máquina
    const totalPower = selectedMachines.reduce((sum, m) => sum + (electricPower * m.quantity), 0);
    
    setEnergyConsumption({
      initial: newHeatingTime * totalPower,
      daily: totalPower * 8, // 8 horas por dia
    });
  };

  const addPoolArea = () => {
    setPoolAreas([...poolAreas, { id: poolAreas.length + 1, length: "", width: "", depth: "" }]);
  };

  const removePoolArea = (id: number) => {
    setPoolAreas(poolAreas.filter(area => area.id !== id));
  };

  const updatePoolArea = (id: number, field: keyof PoolArea, value: string) => {
    setPoolAreas(poolAreas.map(area => 
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  const toggleMonth = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const updateMachineQuantity = (index: number, quantity: number) => {
    const updated = [...selectedMachines];
    updated[index].quantity = Math.max(1, quantity);
    setSelectedMachines(updated);
    recalculateWithSelectedMachines();
  };

  const resetForm = () => {
    setSegment(null);
    setStep(1);
    setSelectedCity("");
    setSelectedMonths([]);
    setUseFrequency("");
    setDesiredTemp("");
    setIsEnclosed(false);
    setEnclosedArea("");
    setPoolSurfaceArea("");
    setIsSuspended(false);
    setPoolAreas([{ id: 1, length: "", width: "", depth: "" }]);
    setHasWaterfall(false);
    setWaterfallHeight("");
    setWaterfallWidth("");
    setHasInfinityEdge(false);
    setInfinityLength("");
    setInfinityHeight("");
    setInfinityWidth("");
  };

  const handleSubmit = () => {
    console.log({
      segment,
      city: selectedCity,
      months: selectedMonths,
      useFrequency,
      desiredTemp,
      isEnclosed,
      enclosedArea,
      poolSurfaceArea,
      isSuspended,
      poolAreas,
      waterfall: hasWaterfall ? { height: waterfallHeight, width: waterfallWidth } : null,
      infinityEdge: hasInfinityEdge ? { length: infinityLength, height: infinityHeight, width: infinityWidth } : null,
    });
    resetForm();
    onOpenChange(false);
  };

  // Renderização de conteúdo baseado na segmentação e step
  const renderContent = () => {
    // Seleção inicial de segmentação
    if (!segment) {
      return (
        <div className="grid grid-cols-2 gap-6 p-6">
          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2"
            onClick={() => setSegment("piscina")}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="rounded-full bg-blue-100 p-6 dark:bg-blue-900">
                <Waves className="h-12 w-12 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold">Piscina</h3>
              <p className="text-center text-muted-foreground">
                Aquecimento para piscinas residenciais e comerciais
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2"
            onClick={() => setSegment("residencial")}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="rounded-full bg-green-100 p-6 dark:bg-green-900">
                <Home className="h-12 w-12 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-2xl font-bold">Residencial</h3>
              <p className="text-center text-muted-foreground">
                Aquecimento residencial e água quente
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Fluxo de Piscina
    if (segment === "piscina") {
      switch (step) {
        case 1: // Local de Instalação
          return (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Local de Instalação da Piscina</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione a cidade para buscar dados climáticos (Fonte: NASA)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade / Estado *</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCities.map((city) => (
                      <SelectItem key={`${city.city}-${city.state}`} value={`${city.city}-${city.state}`}>
                        {city.city} - {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Dados climáticos incluem: Temperatura média mensal, Velocidade do vento, Radiação solar diária
                </p>
              </div>
            </div>
          );

        case 2: // Meses de Utilização
          return (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Meses de Utilização</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os meses em que a piscina será utilizada
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {months.map((month) => (
                  <div key={month} className="flex items-center space-x-2">
                    <Checkbox
                      id={month}
                      checked={selectedMonths.includes(month)}
                      onCheckedChange={() => toggleMonth(month)}
                    />
                    <Label htmlFor={month} className="cursor-pointer font-normal">
                      {month}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm mb-3 text-blue-900 dark:text-blue-100">
                  Dados Climáticos do Período Selecionado
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Velocidade do Vento - Fatores de Correção:</p>
                    <ul className="ml-4 mt-1 space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Vento até 18 km/h: <strong>Fator 1,15</strong></li>
                      <li>• Vento entre 18,1 km/h e 35 km/h: <strong>Fator 1,25</strong></li>
                      <li>• Vento entre 35,1 km/h e 44 km/h: <strong>Fator 1,80</strong></li>
                    </ul>
                    <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
                      * Sistema buscará a maior velocidade do vento no período selecionado
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">Temperatura Ambiente:</p>
                    <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                      * Sistema buscará a menor temperatura no período selecionado para cálculos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 3: // Configurações de Uso
          return (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Configurações de Uso</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Defina a frequência e temperatura desejada
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência de Uso *</Label>
                  <Select value={useFrequency} onValueChange={setUseFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">
                        <div className="flex flex-col">
                          <span className="font-medium">Uso Diário</span>
                          <span className="text-xs text-muted-foreground">Tempo para primeiro aquecimento: pode ser maior que 65 horas</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="esporadico">
                        <div className="flex flex-col">
                          <span className="font-medium">Uso Esporádico</span>
                          <span className="text-xs text-muted-foreground">Tempo para primeiro aquecimento: pode ser menor que 24 horas</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temp">Temperatura Desejada (°C) *</Label>
                  <Input
                    id="temp"
                    type="number"
                    min="20"
                    max="36"
                    step="0.5"
                    placeholder="Ex: 28"
                    value={desiredTemp}
                    onChange={(e) => setDesiredTemp(e.target.value)}
                  />
                  
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      ⚠️ Limite máximo: 36°C
                    </p>
                    <p className="text-xs text-orange-800 dark:text-orange-200">
                      Para temperaturas acima de 31°C com tempo de aquecimento superior a 55 horas:
                    </p>
                    <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mt-1">
                      Será aplicado fator de perda de 1,15 para cada grau de elevação acima dos 31°C
                    </p>
                  </div>
                  
                  {parseFloat(desiredTemp) > 31 && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                        🔥 Temperatura elevada detectada ({desiredTemp}°C)
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                        Fator de perda adicional será calculado: {((parseFloat(desiredTemp) - 31) * 0.15).toFixed(2)} 
                        {' '}({parseFloat(desiredTemp) - 31} graus × 1,15)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

        case 4: // Tipo de Ambiente
          return (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Tipo de Ambiente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Características do local da piscina
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enclosed"
                      checked={isEnclosed}
                      onCheckedChange={(checked) => setIsEnclosed(checked as boolean)}
                    />
                    <Label htmlFor="enclosed" className="cursor-pointer font-semibold">
                      🏠 Local Fechado
                    </Label>
                  </div>

                  {isEnclosed && (
                    <div className="ml-6 space-y-4">
                      <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900 border border-teal-300 dark:border-teal-700">
                        <p className="text-xs font-semibold text-teal-900 dark:text-teal-100 mb-1">
                          📐 Dimensionamento de Desumidificador
                        </p>
                        <p className="text-xs text-teal-800 dark:text-teal-200">
                          <strong>Equipamento KODI 120:</strong> 01 máquina para cada 50m² de superfície da piscina e 240m² de área total do ambiente
                        </p>
                        <p className="text-xs font-semibold text-teal-900 dark:text-teal-100 mt-2">
                          ⚙️ Fator de Correção: 1,15
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="enclosed-area">Área Total do Ambiente (m²) *</Label>
                          <Input
                            id="enclosed-area"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 240"
                            value={enclosedArea}
                            onChange={(e) => setEnclosedArea(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pool-surface">Área da Superfície da Piscina (m²) *</Label>
                          <Input
                            id="pool-surface"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 50"
                            value={poolSurfaceArea}
                            onChange={(e) => setPoolSurfaceArea(e.target.value)}
                          />
                        </div>
                      </div>

                      {enclosedArea && poolSurfaceArea && (
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700">
                          <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                            ✅ Desumidificadores necessários:
                          </p>
                          <p className="text-sm font-bold text-green-900 dark:text-green-100 mt-1">
                            {Math.ceil(Math.max(
                              parseFloat(poolSurfaceArea) / 50,
                              parseFloat(enclosedArea) / 240
                            ))} máquina(s) KODI 120
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="suspended"
                      checked={isSuspended}
                      onCheckedChange={(checked) => setIsSuspended(checked as boolean)}
                    />
                    <Label htmlFor="suspended" className="cursor-pointer font-semibold">
                      🏗️ Piscina Suspensa
                    </Label>
                  </div>
                  {isSuspended && (
                    <div className="mt-3 ml-6 p-3 rounded-lg bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700">
                      <p className="text-xs font-semibold text-orange-900 dark:text-orange-100">
                        ⚠️ Fator de Perda: 1,5
                      </p>
                      <p className="text-xs text-orange-800 dark:text-orange-200 mt-1">
                        Piscinas suspensas apresentam maior perda térmica e requerem maior capacidade de aquecimento
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

        case 5: // Dimensões das Áreas
          return (
            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Dimensões da Piscina</h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione as áreas da piscina (rasa, profunda, etc.)
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addPoolArea}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Área
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mb-4">
                <h4 className="font-semibold text-sm mb-2 text-amber-900 dark:text-amber-100">
                  ℹ️ Informações sobre Cálculo de Carga Térmica
                </h4>
                <ul className="text-xs space-y-1 text-amber-800 dark:text-amber-200">
                  <li>• <strong>Áreas com profundidade até 0,6m (rasas):</strong> Cálculo específico aplicado</li>
                  <li>• <strong>Áreas com profundidade acima de 0,6m (profundas):</strong> Cálculo específico aplicado</li>
                  <li>• O sistema calculará a carga térmica separadamente para cada área</li>
                  <li>• Ao final, será dimensionado o número de máquinas por piscina</li>
                </ul>
              </div>

              <div className="space-y-4">
                {poolAreas.map((area, index) => {
                  const depth = parseFloat(area.depth);
                  const isShallow = depth > 0 && depth <= 0.6;
                  
                  return (
                    <div key={area.id} className="p-4 rounded-lg border space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Área {index + 1}</h4>
                          {depth > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isShallow 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                            }`}>
                              {isShallow ? 'Área Rasa (≤ 0,6m)' : 'Área Profunda (> 0,6m)'}
                            </span>
                          )}
                        </div>
                        {poolAreas.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePoolArea(area.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Comprimento (m)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 10"
                            value={area.length}
                            onChange={(e) => updatePoolArea(area.id, "length", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Largura (m)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 5"
                            value={area.width}
                            onChange={(e) => updatePoolArea(area.id, "width", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Profundidade (m)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 1.5"
                            value={area.depth}
                            onChange={(e) => updatePoolArea(area.id, "depth", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );

        case 6: // Características Especiais
          return (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Características Especiais</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Recursos adicionais da piscina
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 mb-4">
                <h4 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                  📊 Cálculo de Carga Térmica Final
                </h4>
                <p className="text-xs text-purple-800 dark:text-purple-200">
                  O sistema realizará o cálculo de carga térmica separado por piscina, dividido por:
                </p>
                <ul className="text-xs space-y-1 mt-2 ml-4 text-purple-700 dark:text-purple-300">
                  <li>• <strong>Áreas rasas</strong> (profundidade ≤ 0,6m)</li>
                  <li>• <strong>Áreas profundas</strong> (profundidade &gt; 0,6m)</li>
                  <li>• <strong>Cascata</strong> (cálculo por área)</li>
                  <li>• <strong>Borda infinita</strong> (cálculo por área)</li>
                </ul>
                <p className="text-xs mt-2 font-semibold text-purple-900 dark:text-purple-100">
                  Resultado: Número de máquinas necessárias por piscina
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-4 p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="waterfall"
                      checked={hasWaterfall}
                      onCheckedChange={(checked) => setHasWaterfall(checked as boolean)}
                    />
                    <Label htmlFor="waterfall" className="cursor-pointer font-semibold">
                      💧 Cascata
                    </Label>
                  </div>

                  {hasWaterfall && (
                    <>
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div className="space-y-2">
                          <Label>Altura da Cascata (m) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 1.5"
                            value={waterfallHeight}
                            onChange={(e) => setWaterfallHeight(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Largura da Cascata (m) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 2"
                            value={waterfallWidth}
                            onChange={(e) => setWaterfallWidth(e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Cálculo específico de carga térmica será aplicado à área da cascata
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-4 p-4 rounded-lg border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infinity"
                      checked={hasInfinityEdge}
                      onCheckedChange={(checked) => setHasInfinityEdge(checked as boolean)}
                    />
                    <Label htmlFor="infinity" className="cursor-pointer font-semibold">
                      ♾️ Borda Infinita
                    </Label>
                  </div>

                  {hasInfinityEdge && (
                    <>
                      <div className="grid grid-cols-3 gap-4 ml-6">
                        <div className="space-y-2">
                          <Label>Comprimento (m) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 10"
                            value={infinityLength}
                            onChange={(e) => setInfinityLength(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Altura (m) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 0.5"
                            value={infinityHeight}
                            onChange={(e) => setInfinityHeight(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Largura (m) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 0.3"
                            value={infinityWidth}
                            onChange={(e) => setInfinityWidth(e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        Cálculo específico de carga térmica será aplicado à área da borda infinita
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );

        case 7: // Resultados e Seleção de Máquinas
          return (
            <div className="space-y-6 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Resultado do Dimensionamento</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cálculo de carga térmica e sugestão de equipamentos
                </p>
              </div>

              {/* Resumo do Cálculo */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-lg mb-4 text-blue-900 dark:text-blue-100">
                  📊 Capacidade Térmica Calculada
                </h4>
                <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Carga Térmica Total</p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {thermalLoad.toFixed(2)} kW
                  </p>
                </div>
                <div className="mt-4 text-xs space-y-1 text-blue-800 dark:text-blue-200">
                  <p>• Período de utilização: {selectedMonths.join(", ")}</p>
                  <p>• Temperatura desejada: {desiredTemp}°C</p>
                  <p>• Tempo de aquecimento inicial: {heatingTime.toFixed(1)} horas</p>
                  <p>• Frequência: {useFrequency === "diario" ? "Uso Diário" : "Uso Esporádico"}</p>
                </div>
              </div>

              {/* Máquinas Sugeridas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">Equipamentos Sugeridos</h4>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    selectedMonths.some(m => coldMonths.includes(m))
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  }`}>
                    {selectedMonths.some(m => coldMonths.includes(m))
                      ? 'Período Frio (26°C teste)'
                      : 'Período Quente (15°C teste)'}
                  </span>
                </div>

                {selectedMachines.map((machine, index) => (
                  <div key={index} className="p-4 rounded-lg border-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-lg text-green-900 dark:text-green-100">
                          {machine.model}
                        </h5>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Capacidade: {machine.capacity} kW | Vazão: {machine.flow} m³/h
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label className="text-sm font-medium">Quantidade:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={machine.quantity}
                          onChange={(e) => updateMachineQuantity(index, parseInt(e.target.value) || 1)}
                          className="w-20 text-center"
                        />
                      </div>
                    </div>
                    <div className="p-3 rounded bg-green-100 dark:bg-green-900 text-xs space-y-1 text-green-800 dark:text-green-200">
                      <p>• <strong>Capacidade total:</strong> {(machine.capacity * machine.quantity).toFixed(2)} kW</p>
                      <p>• <strong>Vazão total:</strong> {(machine.flow * machine.quantity).toFixed(2)} m³/h</p>
                      <p>• <strong>Acessório necessário:</strong> {machine.quantity}x Motobomba c/vazão {machine.flow}m³/h</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recálculo de Tempo e Consumo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <h5 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                    ⏱️ Novo Tempo de Aquecimento
                  </h5>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {heatingTime.toFixed(1)}h
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Tempo para o primeiro aquecimento
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                  <h5 className="font-semibold text-sm mb-2 text-amber-900 dark:text-amber-100">
                    ⚡ Consumo Elétrico
                  </h5>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Primeiro aquecimento:
                  </p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {energyConsumption.initial.toFixed(2)} kWh
                  </p>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mt-2">
                    Estimativa diária:
                  </p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {energyConsumption.daily.toFixed(2)} kWh
                  </p>
                </div>
              </div>

              {/* Desumidificador (se aplicável) */}
              {isEnclosed && enclosedArea && poolSurfaceArea && (
                <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950 border-2 border-teal-300 dark:border-teal-700">
                  <h5 className="font-semibold mb-2 text-teal-900 dark:text-teal-100">
                    💨 Desumidificador de Ambiente
                  </h5>
                  <p className="text-sm text-teal-800 dark:text-teal-200">
                    <strong>Quantidade necessária:</strong> {Math.ceil(Math.max(
                      parseFloat(poolSurfaceArea) / 50,
                      parseFloat(enclosedArea) / 240
                    ))} máquina(s) KODI 120
                  </p>
                  <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
                    Baseado em área de superfície ({poolSurfaceArea}m²) e área total ({enclosedArea}m²)
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Observação:</strong> Os cálculos foram realizados com base nas fórmulas técnicas e dados climáticos da NASA. 
                  Você pode ajustar a quantidade de máquinas conforme necessário. O sistema recalculará automaticamente o tempo 
                  de aquecimento e consumo elétrico.
                </p>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    // Fluxo Residencial (simplificado por enquanto)
    if (segment === "residencial") {
      return (
        <div className="space-y-6 p-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Proposta Residencial</h3>
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        </div>
      );
    }
  };

  const getTotalSteps = () => {
    if (segment === "piscina") return 7;
    if (segment === "residencial") return 1;
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {!segment ? "Nova Proposta - Selecione a Segmentação" : 
             segment === "piscina" ? `Nova Proposta - Piscina (Passo ${step} de ${getTotalSteps()})` :
             "Nova Proposta - Residencial"}
          </DialogTitle>
          <DialogDescription>
            {!segment ? "Escolha o tipo de proposta que deseja criar" :
             segment === "piscina" && step === 1 ? "Informe o local para buscar dados climáticos" :
             segment === "piscina" && step === 2 ? "Selecione os meses de uso da piscina" :
             segment === "piscina" && step === 3 ? "Configure a frequência e temperatura" :
             segment === "piscina" && step === 4 ? "Informe as características do ambiente" :
             segment === "piscina" && step === 5 ? "Defina as dimensões das áreas" :
             segment === "piscina" && step === 6 ? "Adicione características especiais" :
             segment === "piscina" && step === 7 ? "Revise o dimensionamento e equipamentos sugeridos" :
             "Preencha os dados da proposta"}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {segment && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 1) {
                    setSegment(null);
                  } else {
                    setStep(step - 1);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              resetForm();
              onOpenChange(false);
            }}>
              Cancelar
            </Button>

            {segment && (
              <>
                {(segment === "piscina" && step < 7) || (segment === "residencial" && step < 1) ? (
                  <Button onClick={() => {
                    // Se estiver saindo do passo 6, calcular resultados
                    if (segment === "piscina" && step === 6) {
                      calculateResults();
                    }
                    setStep(step + 1);
                  }}>
                    {segment === "piscina" && step === 6 ? "Calcular Dimensionamento" : "Próximo"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    Finalizar Proposta
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
