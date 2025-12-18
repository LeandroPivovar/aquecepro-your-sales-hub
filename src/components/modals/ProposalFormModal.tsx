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
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Waves, Home, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

const mockClients = [
  { id: "1", name: "João Silva", email: "joao@example.com" },
  { id: "2", name: "Maria Santos", email: "maria@example.com" },
  { id: "3", name: "Pedro Oliveira", email: "pedro@example.com" },
  { id: "4", name: "Ana Costa", email: "ana@example.com" },
  { id: "5", name: "Carlos Ferreira", email: "carlos@example.com" },
  { id: "6", name: "Juliana Alves", email: "juliana@example.com" },
  { id: "7", name: "Roberto Lima", email: "roberto@example.com" },
  { id: "8", name: "Fernanda Souza", email: "fernanda@example.com" },
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
  // Segmentação
  const [segment, setSegment] = useState<"piscina" | "residencial" | null>(null);

  // Cliente (para ambos os segmentos)
  const [selectedClient, setSelectedClient] = useState("");
  const [clientOpen, setClientOpen] = useState(false);

  // Serviços Adicionais
  const [needsInstallation, setNeedsInstallation] = useState(false);
  const [needsProject, setNeedsProject] = useState(false);
  
  // Serviços Adicionais - Piscina
  const [hasFiltrationSystem, setHasFiltrationSystem] = useState(false);
  const [hasLighting, setHasLighting] = useState(false);
  const [hasOzone, setHasOzone] = useState(false);
  const [hasChlorineGenerator, setHasChlorineGenerator] = useState(false);
  const [hasWaterfallService, setHasWaterfallService] = useState(false);
  
  // Circulação de Rede (Residencial)
  const [hasNetworkCirculation, setHasNetworkCirculation] = useState(false);
  const [networkCirculationQuantity, setNetworkCirculationQuantity] = useState("");
  
  // Sistema de Pressurização (Residencial)
  const [hasPressurizationSystem, setHasPressurizationSystem] = useState(false);
  const [simultaneousShowers, setSimultaneousShowers] = useState("");

  // Passo 1: Local de Instalação (Piscina)
  const [selectedCity, setSelectedCity] = useState("");

  // Cidade (Residencial)
  const [selectedCityResidential, setSelectedCityResidential] = useState("");

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

  // Formulário Residencial
  // Chuveiros
  // Chuveiro 01
  const [shower1Flow, setShower1Flow] = useState("");
  const [shower1FlowCustom, setShower1FlowCustom] = useState("");
  const [shower1Time, setShower1Time] = useState("");
  const [shower1TimeCustom, setShower1TimeCustom] = useState("");
  
  // Chuveiro 02
  const [shower2Flow, setShower2Flow] = useState("");
  const [shower2FlowCustom, setShower2FlowCustom] = useState("");
  const [shower2Time, setShower2Time] = useState("");
  const [shower2TimeCustom, setShower2TimeCustom] = useState("");
  
  // Torneiras Banheiro
  const [bathroomFlow, setBathroomFlow] = useState("");
  const [bathroomFlowCustom, setBathroomFlowCustom] = useState("");
  const [bathroomTime, setBathroomTime] = useState("");
  const [bathroomTimeCustom, setBathroomTimeCustom] = useState("");
  
  // Banheira
  const [bathtubFlow, setBathtubFlow] = useState("");
  const [bathtubFlowCustom, setBathtubFlowCustom] = useState("");
  const [bathtubFrequency, setBathtubFrequency] = useState("");
  const [bathtubFrequencyCustom, setBathtubFrequencyCustom] = useState("");

  const [kitchenFlow, setKitchenFlow] = useState("");
  const [kitchenFlowCustom, setKitchenFlowCustom] = useState("");
  const [kitchenTime, setKitchenTime] = useState("");
  const [kitchenTimeCustom, setKitchenTimeCustom] = useState("");
  const [kitchenQuantity, setKitchenQuantity] = useState(1);

  const [laundryFlow, setLaundryFlow] = useState("");
  const [laundryFlowCustom, setLaundryFlowCustom] = useState("");
  const [laundryTime, setLaundryTime] = useState("");
  const [laundryTimeCustom, setLaundryTimeCustom] = useState("");
  const [laundryQuantity, setLaundryQuantity] = useState(1);

  const [maxSimultaneousFlow, setMaxSimultaneousFlow] = useState(0);

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

  const calculateMaxSimultaneousFlow = () => {
    const flows: number[] = [];

    // Chuveiro 01
    if (shower1Flow || shower1FlowCustom) {
      const flow = shower1Flow === "custom" ? parseFloat(shower1FlowCustom) : parseFloat(shower1Flow);
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow);
      }
    }

    // Chuveiro 02
    if (shower2Flow || shower2FlowCustom) {
      const flow = shower2Flow === "custom" ? parseFloat(shower2FlowCustom) : parseFloat(shower2Flow);
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow);
      }
    }

    // Torneiras Banheiro
    if (bathroomFlow || bathroomFlowCustom) {
      const flow = bathroomFlow === "custom" ? parseFloat(bathroomFlowCustom) : parseFloat(bathroomFlow);
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow);
      }
    }

    // Banheira
    if (bathtubFlow || bathtubFlowCustom) {
      const flow = bathtubFlow === "custom" ? parseFloat(bathtubFlowCustom) : parseFloat(bathtubFlow);
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow);
      }
    }

    // Cozinha
    if (kitchenFlow || kitchenFlowCustom) {
      const flow = kitchenFlow === "custom" ? parseFloat(kitchenFlowCustom) : parseFloat(kitchenFlow);
      if (!isNaN(flow) && kitchenQuantity > 0) {
        flows.push(flow * kitchenQuantity);
      }
    }

    // Lavanderia
    if (laundryFlow || laundryFlowCustom) {
      const flow = laundryFlow === "custom" ? parseFloat(laundryFlowCustom) : parseFloat(laundryFlow);
      if (!isNaN(flow) && laundryQuantity > 0) {
        flows.push(flow * laundryQuantity);
      }
    }

    // Vazão máxima simultânea = soma das maiores vazões
    const totalFlow = flows.reduce((sum, f) => sum + f, 0);
    setMaxSimultaneousFlow(totalFlow);
    return totalFlow;
  };

  const resetForm = () => {
    setSegment(null);
    setSelectedClient("");
    setClientOpen(false);
    setNeedsInstallation(false);
    setNeedsProject(false);
    setHasFiltrationSystem(false);
    setHasLighting(false);
    setHasOzone(false);
    setHasChlorineGenerator(false);
    setHasWaterfallService(false);
    setSelectedCity("");
    setSelectedCityResidential("");
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
    
    // Reset Residencial
    // Chuveiro 01
    setShower1Flow("");
    setShower1FlowCustom("");
    setShower1Time("");
    setShower1TimeCustom("");
    // Chuveiro 02
    setShower2Flow("");
    setShower2FlowCustom("");
    setShower2Time("");
    setShower2TimeCustom("");
    setBathroomFlow("");
    setBathroomFlowCustom("");
    setBathroomTime("");
    setBathroomTimeCustom("");
    setBathtubFlow("");
    setBathtubFlowCustom("");
    setBathtubFrequency("");
    setBathtubFrequencyCustom("");
    setKitchenFlow("");
    setKitchenFlowCustom("");
    setKitchenTime("");
    setKitchenTimeCustom("");
    setKitchenQuantity(1);
    setLaundryFlow("");
    setLaundryFlowCustom("");
    setLaundryTime("");
    setLaundryTimeCustom("");
    setLaundryQuantity(1);
    setHasNetworkCirculation(false);
    setNetworkCirculationQuantity("");
    setHasPressurizationSystem(false);
    setSimultaneousShowers("");
    setMaxSimultaneousFlow(0);
  };

  const handleSubmit = () => {
    if (segment === "piscina") {
    console.log({
        segment,
        client: selectedClient,
        needsInstallation,
        needsProject,
        additionalServices: {
          filtrationSystem: hasFiltrationSystem,
          lighting: hasLighting,
          ozone: hasOzone,
          chlorineGenerator: hasChlorineGenerator,
          waterfall: hasWaterfallService,
        },
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
    } else if (segment === "residencial") {
      const maxFlow = calculateMaxSimultaneousFlow();
      console.log({
        segment,
        client: selectedClient,
        city: selectedCityResidential,
        needsInstallation,
        needsProject,
        shower1: {
          flow: shower1Flow === "custom" ? shower1FlowCustom : shower1Flow,
          time: shower1Time === "custom" ? shower1TimeCustom : shower1Time,
        },
        shower2: {
          flow: shower2Flow === "custom" ? shower2FlowCustom : shower2Flow,
          time: shower2Time === "custom" ? shower2TimeCustom : shower2Time,
        },
        bathroom: {
          flow: bathroomFlow === "custom" ? bathroomFlowCustom : bathroomFlow,
          time: bathroomTime === "custom" ? bathroomTimeCustom : bathroomTime,
        },
        bathtub: {
          flow: bathtubFlow === "custom" ? bathtubFlowCustom : bathtubFlow,
          frequency: bathtubFrequency === "custom" ? bathtubFrequencyCustom : bathtubFrequency,
        },
        kitchen: {
          flow: kitchenFlow === "custom" ? kitchenFlowCustom : kitchenFlow,
          time: kitchenTime === "custom" ? kitchenTimeCustom : kitchenTime,
          quantity: kitchenQuantity,
        },
        laundry: {
          flow: laundryFlow === "custom" ? laundryFlowCustom : laundryFlow,
          time: laundryTime === "custom" ? laundryTimeCustom : laundryTime,
          quantity: laundryQuantity,
        },
        networkCirculation: hasNetworkCirculation ? {
          enabled: true,
          quantity: networkCirculationQuantity,
        } : { enabled: false },
        pressurizationSystem: hasPressurizationSystem ? {
          enabled: true,
          simultaneousShowers: simultaneousShowers,
        } : { enabled: false },
        maxSimultaneousFlow: maxFlow,
        maxSimultaneousFlowPerHour: maxFlow * 60,
      });
    }
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

    // Fluxo de Piscina - Formulário Unificado
    if (segment === "piscina") {
      return (
        <div className="space-y-6 p-6">
          {/* Seção 0: Cliente */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cliente</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione o cliente para esta proposta
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="w-full justify-between"
                  >
                    {selectedClient
                      ? mockClients.find((client) => client.id === selectedClient)?.name
                      : "Selecione o cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        {mockClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.name} ${client.email}`}
                            onSelect={() => {
                              setSelectedClient(client.id === selectedClient ? "" : client.id);
                              setClientOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{client.name}</span>
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            </div>

          <Separator />

          {/* Seção 1: Local de Instalação */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Local de Instalação</h3>
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

          <Separator />

          {/* Seção 2: Meses de Utilização */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">2. Meses de Utilização</h3>
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
          </div>

          <Separator />

          {/* Seção 3: Configurações de Uso */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">3. Configurações de Uso</h3>
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

          <Separator />

          {/* Seção 4: Tipo de Ambiente */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">4. Tipo de Ambiente</h3>
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
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 5: Dimensões das Áreas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">5. Dimensões da Piscina</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione as áreas da piscina (rasa, profunda, etc.)
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addPoolArea}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Área
              </Button>
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

          <Separator />

          {/* Seção 6: Características Especiais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">6. Características Especiais</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recursos adicionais da piscina
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

          <Separator />

          {/* Seção 7: Resultados e Seleção de Máquinas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">7. Resultado do Dimensionamento</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cálculo de carga térmica e sugestão de equipamentos
                </p>
            </div>
              <Button onClick={calculateResults} variant="default">
                Calcular Dimensionamento
              </Button>
            </div>

            {thermalLoad > 0 && (
              <>
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
                    <p>• Período de utilização: {selectedMonths.join(", ") || "Não selecionado"}</p>
                    <p>• Temperatura desejada: {desiredTemp || "Não informada"}°C</p>
                    <p>• Tempo de aquecimento inicial: {heatingTime.toFixed(1)} horas</p>
                    <p>• Frequência: {useFrequency === "diario" ? "Uso Diário" : useFrequency === "esporadico" ? "Uso Esporádico" : "Não selecionada"}</p>
                  </div>
                </div>

                {/* Máquinas Sugeridas */}
                {selectedMachines.length > 0 && (
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
                )}

                {/* Recálculo de Tempo e Consumo */}
                {heatingTime > 0 && (
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
                )}

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
              </>
            )}
          </div>

          <Separator />

          {/* Seção 8: Serviços Adicionais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">8. Serviços Adicionais</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os serviços adicionais necessários
              </p>
            </div>
            <div className="space-y-3">
              {/* Projetos */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <Checkbox
                  id="project"
                  checked={needsProject}
                  onCheckedChange={(checked) => setNeedsProject(checked as boolean)}
                />
                <Label htmlFor="project" className="cursor-pointer font-semibold">
                  📐 Projetos
                </Label>
              </div>

              {/* Serviço de Instalação */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <Checkbox
                  id="installation"
                  checked={needsInstallation}
                  onCheckedChange={(checked) => setNeedsInstallation(checked as boolean)}
                />
                <Label htmlFor="installation" className="cursor-pointer font-semibold">
                  🔧 Serviço de Instalação
                </Label>
              </div>

              {/* Sistema de Filtragem */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <Checkbox
                  id="filtration-system"
                  checked={hasFiltrationSystem}
                  onCheckedChange={(checked) => setHasFiltrationSystem(checked as boolean)}
                />
                <Label htmlFor="filtration-system" className="cursor-pointer font-semibold">
                  🔄 Sistema de Filtragem
                </Label>
              </div>

              {/* Iluminação */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
                <Checkbox
                  id="lighting"
                  checked={hasLighting}
                  onCheckedChange={(checked) => setHasLighting(checked as boolean)}
                />
                <Label htmlFor="lighting" className="cursor-pointer font-semibold">
                  💡 Iluminação
                </Label>
              </div>

              {/* Ozônio */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950">
                <Checkbox
                  id="ozone"
                  checked={hasOzone}
                  onCheckedChange={(checked) => setHasOzone(checked as boolean)}
                />
                <Label htmlFor="ozone" className="cursor-pointer font-semibold">
                  ⚡ Ozônio
                </Label>
              </div>

              {/* Gerador de Cloro */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                <Checkbox
                  id="chlorine-generator"
                  checked={hasChlorineGenerator}
                  onCheckedChange={(checked) => setHasChlorineGenerator(checked as boolean)}
                />
                <Label htmlFor="chlorine-generator" className="cursor-pointer font-semibold">
                  🧪 Gerador de Cloro
                </Label>
              </div>

              {/* Cascata */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950">
                <Checkbox
                  id="waterfall-service"
                  checked={hasWaterfallService}
                  onCheckedChange={(checked) => setHasWaterfallService(checked as boolean)}
                />
                <Label htmlFor="waterfall-service" className="cursor-pointer font-semibold">
                  🌊 Cascata
                </Label>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fluxo Residencial - Formulário Unificado
    if (segment === "residencial") {
      return (
        <div className="space-y-6 p-6">
          {/* Seção 0: Cliente */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cliente</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione o cliente para esta proposta
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-res">Cliente *</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="w-full justify-between"
                  >
                    {selectedClient
                      ? mockClients.find((client) => client.id === selectedClient)?.name
                      : "Selecione o cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        {mockClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.name} ${client.email}`}
                            onSelect={() => {
                              setSelectedClient(client.id === selectedClient ? "" : client.id);
                              setClientOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{client.name}</span>
                              <span className="text-xs text-muted-foreground">{client.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Seção 0.5: Cidade */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cidade</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione a cidade para buscar dados climáticos (Fonte: NASA)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-res">Cidade / Estado *</Label>
              <Select value={selectedCityResidential} onValueChange={setSelectedCityResidential}>
                <SelectTrigger id="city-res">
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

          <Separator />

          {/* Seção 1: Banheiros */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Banheiros</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure os equipamentos do ambiente banheiro
              </p>
            </div>

            {/* Chuveiro 01 */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <h4 className="font-semibold text-base mb-3">🚿 Chuveiro 01</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shower1-flow">Vazão (L/min) *</Label>
                  <div className="flex gap-2">
                    <Select value={shower1Flow} onValueChange={setShower1Flow}>
                      <SelectTrigger id="shower1-flow" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 L/min</SelectItem>
                        <SelectItem value="6">6 L/min (Padrão)</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {shower1Flow === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="L/min"
                        value={shower1FlowCustom}
                        onChange={(e) => setShower1FlowCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shower1-time">Tempo de Utilização (min) *</Label>
                  <div className="flex gap-2">
                    <Select value={shower1Time} onValueChange={setShower1Time}>
                      <SelectTrigger id="shower1-time" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 min</SelectItem>
                        <SelectItem value="6">6 min</SelectItem>
                        <SelectItem value="8">8 min (Padrão)</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {shower1Time === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="min"
                        value={shower1TimeCustom}
                        onChange={(e) => setShower1TimeCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chuveiro 02 */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <h4 className="font-semibold text-base mb-3">🚿 Chuveiro 02</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shower2-flow">Vazão (L/min) *</Label>
                  <div className="flex gap-2">
                    <Select value={shower2Flow} onValueChange={setShower2Flow}>
                      <SelectTrigger id="shower2-flow" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 L/min</SelectItem>
                        <SelectItem value="6">6 L/min (Padrão)</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {shower2Flow === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="L/min"
                        value={shower2FlowCustom}
                        onChange={(e) => setShower2FlowCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shower2-time">Tempo de Utilização (min) *</Label>
                  <div className="flex gap-2">
                    <Select value={shower2Time} onValueChange={setShower2Time}>
                      <SelectTrigger id="shower2-time" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 min</SelectItem>
                        <SelectItem value="6">6 min</SelectItem>
                        <SelectItem value="8">8 min (Padrão)</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {shower2Time === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="min"
                        value={shower2TimeCustom}
                        onChange={(e) => setShower2TimeCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Torneiras Banheiro */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <h4 className="font-semibold text-base mb-3">💧 Torneiras</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathroom-flow">Vazão (L/min) *</Label>
                  <div className="flex gap-2">
                    <Select value={bathroomFlow} onValueChange={setBathroomFlow}>
                      <SelectTrigger id="bathroom-flow" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 L/min</SelectItem>
                        <SelectItem value="6">6 L/min (Padrão)</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {bathroomFlow === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="L/min"
                        value={bathroomFlowCustom}
                        onChange={(e) => setBathroomFlowCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathroom-time">Tempo de Utilização (min) *</Label>
                  <div className="flex gap-2">
                    <Select value={bathroomTime} onValueChange={setBathroomTime}>
                      <SelectTrigger id="bathroom-time" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 min</SelectItem>
                        <SelectItem value="6">6 min</SelectItem>
                        <SelectItem value="8">8 min (Padrão)</SelectItem>
                        <SelectItem value="10">10 min</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {bathroomTime === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="min"
                        value={bathroomTimeCustom}
                        onChange={(e) => setBathroomTimeCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Banheira */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <h4 className="font-semibold text-base mb-3">🛁 Banheira</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathtub-flow">Vazão (L/min) *</Label>
                  <div className="flex gap-2">
                    <Select value={bathtubFlow} onValueChange={setBathtubFlow}>
                      <SelectTrigger id="bathtub-flow" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">250 L/min</SelectItem>
                        <SelectItem value="300">300 L/min</SelectItem>
                        <SelectItem value="350">350 L/min (Padrão)</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {bathtubFlow === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="L/min"
                        value={bathtubFlowCustom}
                        onChange={(e) => setBathtubFlowCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathtub-freq">Frequência de Uso (min) *</Label>
                  <div className="flex gap-2">
                    <Select value={bathtubFrequency} onValueChange={setBathtubFrequency}>
                      <SelectTrigger id="bathtub-freq" className="flex-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 min</SelectItem>
                        <SelectItem value="2">2 min (Padrão)</SelectItem>
                        <SelectItem value="3">3 min</SelectItem>
                        <SelectItem value="custom">Digitar</SelectItem>
                      </SelectContent>
                    </Select>
                    {bathtubFrequency === "custom" && (
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="min"
                        value={bathtubFrequencyCustom}
                        onChange={(e) => setBathtubFrequencyCustom(e.target.value)}
                        className="w-32"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 2: Cozinha */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">2. Cozinha</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure a vazão e tempo de utilização das torneiras da cozinha
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kitchen-flow">Vazão das Torneiras (L/min) *</Label>
                <Select value={kitchenFlow} onValueChange={setKitchenFlow}>
                  <SelectTrigger id="kitchen-flow">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 L/min</SelectItem>
                    <SelectItem value="6">6 L/min</SelectItem>
                    <SelectItem value="9">9 L/min (Padrão)</SelectItem>
                    <SelectItem value="custom">Digitar vazão</SelectItem>
                  </SelectContent>
                </Select>
                {kitchenFlow === "custom" && (
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Digite a vazão"
                    value={kitchenFlowCustom}
                    onChange={(e) => setKitchenFlowCustom(e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchen-time">Tempo de Utilização (min) *</Label>
                <Select value={kitchenTime} onValueChange={setKitchenTime}>
                  <SelectTrigger id="kitchen-time">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min (Padrão)</SelectItem>
                    <SelectItem value="custom">Digitar tempo</SelectItem>
                  </SelectContent>
                </Select>
                {kitchenTime === "custom" && (
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Digite o tempo"
                    value={kitchenTimeCustom}
                    onChange={(e) => setKitchenTimeCustom(e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchen-qty">Quantidade *</Label>
                <Input
                  id="kitchen-qty"
                  type="number"
                  min="1"
                  value={kitchenQuantity}
                  onChange={(e) => setKitchenQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 3: Lavanderia */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">3. Lavanderia</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure a vazão e tempo de utilização das torneiras da lavanderia
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laundry-flow">Vazão das Torneiras (L/min) *</Label>
                <Select value={laundryFlow} onValueChange={setLaundryFlow}>
                  <SelectTrigger id="laundry-flow">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 L/min</SelectItem>
                    <SelectItem value="6">6 L/min</SelectItem>
                    <SelectItem value="9">9 L/min (Padrão)</SelectItem>
                    <SelectItem value="custom">Digitar vazão</SelectItem>
                  </SelectContent>
                </Select>
                {laundryFlow === "custom" && (
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Digite a vazão"
                    value={laundryFlowCustom}
                    onChange={(e) => setLaundryFlowCustom(e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="laundry-time">Tempo de Utilização (min) *</Label>
                <Select value={laundryTime} onValueChange={setLaundryTime}>
                  <SelectTrigger id="laundry-time">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 min (Padrão)</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="custom">Digitar tempo</SelectItem>
                  </SelectContent>
                </Select>
                {laundryTime === "custom" && (
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Digite o tempo"
                    value={laundryTimeCustom}
                    onChange={(e) => setLaundryTimeCustom(e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="laundry-qty">Quantidade *</Label>
                <Input
                  id="laundry-qty"
                  type="number"
                  min="1"
                  value={laundryQuantity}
                  onChange={(e) => setLaundryQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 5: Serviços Adicionais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">5. Serviços Adicionais</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os adicionais necessários
              </p>
            </div>
            <div className="space-y-3">
              {/* Projetos */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <Checkbox
                  id="project-res"
                  checked={needsProject}
                  onCheckedChange={(checked) => setNeedsProject(checked as boolean)}
                />
                <Label htmlFor="project-res" className="cursor-pointer font-semibold">
                  📐 Projetos
                </Label>
              </div>

              {/* Serviços de Instalação */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <Checkbox
                  id="installation-res"
                  checked={needsInstallation}
                  onCheckedChange={(checked) => setNeedsInstallation(checked as boolean)}
                />
                <Label htmlFor="installation-res" className="cursor-pointer font-semibold">
                  🔧 Serviços de Instalação
                </Label>
              </div>

              {/* Sistema de Circulação de Rede */}
              <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="network-circulation"
                    checked={hasNetworkCirculation}
                    onCheckedChange={(checked) => setHasNetworkCirculation(checked as boolean)}
                  />
                  <Label htmlFor="network-circulation" className="cursor-pointer font-semibold">
                    🔄 Sistema de Circulação de Rede
                  </Label>
                </div>
                {hasNetworkCirculation && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="network-circulation-qty">Quantidade *</Label>
                    <Input
                      id="network-circulation-qty"
                      type="number"
                      min="1"
                      placeholder="Digite a quantidade"
                      value={networkCirculationQuantity}
                      onChange={(e) => setNetworkCirculationQuantity(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Sistema de Pressurização */}
              <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="pressurization-system"
                    checked={hasPressurizationSystem}
                    onCheckedChange={(checked) => setHasPressurizationSystem(checked as boolean)}
                  />
                  <Label htmlFor="pressurization-system" className="cursor-pointer font-semibold">
                    💧 Sistema de Pressurização
                  </Label>
                </div>
                {hasPressurizationSystem && (
                  <div className="ml-6 space-y-4 p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="space-y-2">
                      <Label htmlFor="simultaneous-showers" className="text-sm font-medium">
                        Simultaneidade dos Pontos
                      </Label>
                      <Label htmlFor="simultaneous-showers-qty" className="text-xs text-muted-foreground block">
                        Quantidade de chuveiros simultâneos
                      </Label>
                      <Input
                        id="simultaneous-showers-qty"
                        type="number"
                        min="1"
                        placeholder="Digite a quantidade de chuveiros simultâneos"
                        value={simultaneousShowers}
                        onChange={(e) => setSimultaneousShowers(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
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
             segment === "piscina" ? "Nova Proposta - Piscina" :
             "Nova Proposta - Residencial"}
          </DialogTitle>
          <DialogDescription>
            {!segment ? "Escolha o tipo de proposta que deseja criar" :
             segment === "piscina" ? "Preencha todas as informações para calcular o dimensionamento" :
             "Preencha os dados da proposta"}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => {
            resetForm();
            onOpenChange(false);
          }}>
            Cancelar
          </Button>

          {segment === "piscina" && (
            <Button onClick={handleSubmit}>
              Finalizar Proposta
          </Button>
          )}

          {segment === "residencial" && (
            <Button onClick={handleSubmit}>
              Criar Proposta
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
