import { useState, useEffect } from "react";
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
import { api, Product, Proposal } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface ProposalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal?: Proposal; // Proposta para edição (opcional)
}

const mockCities = [
  { city: "São Paulo", state: "SP" },
  { city: "Campinas", state: "SP" },
  { city: "Santos", state: "SP" },
  { city: "Rio de Janeiro", state: "RJ" },
];

// Dados climáticos das cidades (temperatura mínima em °C)
const cityClimateData: Record<string, number> = {
  "São Paulo-SP": 10.0,
  "Campinas-SP": 8.5,
  "Santos-SP": 12.0,
  "Rio de Janeiro-RJ": 15.0,
};

// Aquecedores a gás cadastrados (mock)
interface GasHeater {
  id: string;
  model: string;
  power: number; // Potência em kcal/h
  efficiency: number; // Eficiência (padrão 0.85)
}

const mockGasHeaters: GasHeater[] = [
  { id: "1", model: "AQG-15", power: 15000, efficiency: 0.85 },
  { id: "2", model: "AQG-20", power: 20000, efficiency: 0.85 },
  { id: "3", model: "AQG-25", power: 25000, efficiency: 0.85 },
  { id: "4", model: "AQG-30", power: 30000, efficiency: 0.85 },
  { id: "5", model: "AQG-35", power: 35000, efficiency: 0.85 },
  { id: "6", model: "AQG-40", power: 40000, efficiency: 0.85 },
  { id: "7", model: "AQG-50", power: 50000, efficiency: 0.85 },
];

// Coletores solares cadastrados (mock)
interface SolarCollector {
  id: string;
  model: string;
  area: number; // Área em m²
  production?: number; // Produção (opcional)
}

const mockSolarCollectors: SolarCollector[] = [
  { id: "1", model: "CS-2.0", area: 2.0, production: 1200 },
  { id: "2", model: "CS-2.5", area: 2.5, production: 1500 },
  { id: "3", model: "CS-3.0", area: 3.0, production: 1800 },
  { id: "4", model: "CS-4.0", area: 4.0, production: 2400 },
  { id: "5", model: "CS-5.0", area: 5.0, production: 3000 },
  { id: "6", model: "CS-6.0", area: 6.0, production: 3600 },
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

export function ProposalFormModal({ open, onOpenChange, proposal }: ProposalFormModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!proposal;
  
  // Segmentação
  const [segment, setSegment] = useState<"piscina" | "residencial" | null>(proposal?.segment || null);

  // Cliente (para ambos os segmentos)
  const [selectedClient, setSelectedClient] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  // Serviços Adicionais
  const [needsInstallation, setNeedsInstallation] = useState(true);
  const [needsProject, setNeedsProject] = useState(true);
  
  // Temperatura de Consumo (Piscina)
  const [consumptionTemp, setConsumptionTemp] = useState("40");
  const [consumptionTempCustom, setConsumptionTempCustom] = useState("");
  
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
  const [shower1Quantity, setShower1Quantity] = useState("");
  const [shower2Quantity, setShower2Quantity] = useState("");
  
  // Estrutura para Laje (Residencial)
  const [hasLajeStructure, setHasLajeStructure] = useState(false);

  // Passo 1: Local de Instalação (Piscina)
  const [selectedCity, setSelectedCity] = useState("");

  // Cidade (Residencial)
  const [selectedCityResidential, setSelectedCityResidential] = useState("");

  // Passo 2: Meses de Utilização
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Passo 3: Configurações de Uso
  const [useFrequency, setUseFrequency] = useState("");
  const [desiredTemp, setDesiredTemp] = useState("");

  // Passo 4: Tipo de Ambiente (movido para Características Especiais)
  const [isEnclosed, setIsEnclosed] = useState(false);
  const [enclosedArea, setEnclosedArea] = useState("");
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

  // Tipos de Sistemas de Aquecimento (Residencial)
  const [selectedHeatingTypes, setSelectedHeatingTypes] = useState<string[]>([]);
  
  // Equipamentos selecionados por tipo de sistema
  const [selectedEquipments, setSelectedEquipments] = useState<Record<string, string[]>>({});

  // Seleção de Aquecedor a Gás (Opção 02)
  const [gasHeaterOpen, setGasHeaterOpen] = useState(false);
  const [selectedGasHeater, setSelectedGasHeater] = useState<string>("");
  const [gasHeaterCustom, setGasHeaterCustom] = useState("");
  const [gasHeaterQuantity, setGasHeaterQuantity] = useState("1");
  const [hasCascadeSystem, setHasCascadeSystem] = useState(false);
  const [calculatedPower, setCalculatedPower] = useState<number | null>(null);

  // Seleção de Coletor Solar (Opção 03)
  const [solarCollectorOpen, setSolarCollectorOpen] = useState(false);
  const [selectedSolarCollector, setSelectedSolarCollector] = useState<string>("");
  const [solarCollectorCustom, setSolarCollectorCustom] = useState("");
  const [solarCollectorQuantity, setSolarCollectorQuantity] = useState("1");
  const [collectorInclination, setCollectorInclination] = useState("");
  const [collectorOrientation, setCollectorOrientation] = useState("");
  const [calculatedRequiredArea, setCalculatedRequiredArea] = useState<number | null>(null);

  // Buscar produtos do backend
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
    enabled: segment === "residencial", // Só buscar quando o segmento for residencial
  });

  // Filtrar produtos por tipo de sistema de aquecimento
  const getEquipmentsByHeatingType = (heatingType: string): Product[] => {
    if (!products.length) return [];
    
    // Filtrar apenas produtos residenciais e ativos
    const residentialProducts = products.filter(
      (p) => p.segment === "Residencial" && p.status === "active"
    );

    // Mapear tipos de sistemas para categorias de produtos (normalizado para comparação)
    const categoryMapping: Record<string, string[]> = {
      "Opção 01": [
        "Reservatório",
        "reservatório",
        "Bombas de circulacao",
        "bombas de circulacao",
        "Bombas de circulação",
        "bombas de circulação",
        "Controlador digital",
        "controlador digital",
        "Motobombas",
        "motobombas",
      ],
      "Opção 04": [
        "Reservatório",
        "reservatório",
        "Bombas de circulacao",
        "bombas de circulacao",
        "Bombas de circulação",
        "bombas de circulação",
        "Controlador digital",
        "controlador digital",
        "Motobombas",
        "motobombas",
        "Kit pressurizacao indireto",
        "kit pressurizacao indireto",
        "Kit pressurização indireto",
        "kit pressurização indireto",
        "Pressurizador",
        "pressurizador",
      ],
    };

    const allowedCategories = categoryMapping[heatingType] || [];
    
    if (allowedCategories.length === 0) return [];

    // Normalizar strings para comparação (remover acentos e converter para minúsculas)
    const normalizeString = (str: string): string => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };

    // Filtrar produtos que pertencem às categorias permitidas
    return residentialProducts.filter((product) => {
      const category2Normalized = normalizeString(product.category2 || "");
      return allowedCategories.some((cat) => 
        category2Normalized === normalizeString(cat)
      );
    });
  };

  // Funções de cálculo
  const calculatePoolSurfaceArea = () => {
    return poolAreas.reduce((total, area) => {
      const length = parseFloat(area.length) || 0;
      const width = parseFloat(area.width) || 0;
      return total + (length * width);
    }, 0);
  };

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

    // Chuveiro 01 - considerar simultaneidade (quantidade)
    if (shower1Flow || shower1FlowCustom) {
      const flow = shower1FlowCustom ? parseFloat(shower1FlowCustom) : parseFloat(shower1Flow);
      const quantity = parseFloat(shower1Quantity) || 1; // Quantidade de chuveiros simultâneos
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow * quantity);
      }
    }

    // Chuveiro 02 - considerar simultaneidade (quantidade)
    if (shower2Flow || shower2FlowCustom) {
      const flow = shower2FlowCustom ? parseFloat(shower2FlowCustom) : parseFloat(shower2Flow);
      const quantity = parseFloat(shower2Quantity) || 1; // Quantidade de chuveiros simultâneos
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow * quantity);
      }
    }

    // Torneiras Banheiro
    if (bathroomFlow || bathroomFlowCustom) {
      const flow = bathroomFlowCustom ? parseFloat(bathroomFlowCustom) : parseFloat(bathroomFlow);
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow);
      }
    }

    // Banheira
    if (bathtubFlow || bathtubFlowCustom) {
      const flow = bathtubFlowCustom ? parseFloat(bathtubFlowCustom) : parseFloat(bathtubFlow);
      if (!isNaN(flow) && flow > 0) {
        flows.push(flow);
      }
    }

    // Cozinha
    if (kitchenFlow || kitchenFlowCustom) {
      const flow = kitchenFlowCustom ? parseFloat(kitchenFlowCustom) : parseFloat(kitchenFlow);
      if (!isNaN(flow) && kitchenQuantity > 0) {
        flows.push(flow * kitchenQuantity);
      }
    }

    // Lavanderia
    if (laundryFlow || laundryFlowCustom) {
      const flow = laundryFlowCustom ? parseFloat(laundryFlowCustom) : parseFloat(laundryFlow);
      if (!isNaN(flow) && laundryQuantity > 0) {
        flows.push(flow * laundryQuantity);
      }
    }

    // Vazão máxima simultânea = soma das maiores vazões
    const totalFlow = flows.reduce((sum, f) => sum + f, 0);
    setMaxSimultaneousFlow(totalFlow);
    return totalFlow;
  };

  // Funções para gerenciar tipos de sistemas de aquecimento
  const toggleHeatingType = (type: string) => {
    setSelectedHeatingTypes(prev => {
      if (prev.includes(type)) {
        // Se desmarcar, remover também os equipamentos selecionados desse tipo
        const newEquipments = { ...selectedEquipments };
        delete newEquipments[type];
        setSelectedEquipments(newEquipments);
        return prev.filter(t => t !== type);
      } else {
        // Se marcar, adicionar o tipo
        // Se for "Opção 04", também selecionar automaticamente "Opção 01"
        if (type === "Opção 04") {
          const newTypes = [...prev];
          if (!newTypes.includes("Opção 01")) {
            newTypes.push("Opção 01");
          }
          newTypes.push(type);
          return newTypes;
        }
        return [...prev, type];
      }
    });
  };

  // Funções para gerenciar equipamentos selecionados
  const toggleEquipment = (heatingType: string, equipment: string) => {
    setSelectedEquipments(prev => {
      const currentEquipments = prev[heatingType] || [];
      const newEquipments = { ...prev };
      
      if (currentEquipments.includes(equipment)) {
        newEquipments[heatingType] = currentEquipments.filter(e => e !== equipment);
      } else {
        newEquipments[heatingType] = [...currentEquipments, equipment];
      }
      
      return newEquipments;
    });
  };

  // Função para calcular potência necessária do aquecedor a gás
  const calculateGasHeaterPower = () => {
    // Recalcular vazão máxima simultânea
    const currentMaxFlow = calculateMaxSimultaneousFlow();
    
    // V_simultaneo: Vazão máxima simultânea em litros/hora
    const maxSimultaneousFlowLitersPerHour = currentMaxFlow * 60; // Converter de L/min para L/h
    
    // T_consumo: Temperatura de consumo
    const consumptionTempValue = parseFloat(consumptionTempCustom || consumptionTemp) || 40;
    
    // T_ambiente_minima: Temperatura mínima local
    const cityKey = selectedCityResidential;
    const minAmbientTemp = cityClimateData[cityKey] || 10; // Default 10°C se não encontrar
    
    // eficiencia: Eficiência do equipamento = 0.85
    const efficiency = 0.85;
    
    // Fórmula: E_total = V_simultaneo x (T_consumo - T_ambiente_minima) ÷ eficiencia
    const power = (maxSimultaneousFlowLitersPerHour * (consumptionTempValue - minAmbientTemp)) / efficiency;
    
    setCalculatedPower(power);
    return power;
  };

  // Função para pré-selecionar o aquecedor mais próximo da potência calculada
  const preselectGasHeater = (requiredPower: number) => {
    let bestHeater = mockGasHeaters[0];
    let minDiff = Math.abs(requiredPower - bestHeater.power);
    
    for (const heater of mockGasHeaters) {
      const diff = Math.abs(requiredPower - heater.power);
      if (diff < minDiff) {
        minDiff = diff;
        bestHeater = heater;
      }
    }
    
    setSelectedGasHeater(bestHeater.id);
    setGasHeaterCustom("");
  };

  // Função para calcular área necessária para 70% da demanda
  const calculateRequiredSolarArea = () => {
    // Calcular potência necessária (similar ao cálculo do aquecedor a gás)
    const currentMaxFlow = calculateMaxSimultaneousFlow();
    const maxSimultaneousFlowLitersPerHour = currentMaxFlow * 60;
    const consumptionTempValue = parseFloat(consumptionTempCustom || consumptionTemp) || 40;
    const cityKey = selectedCityResidential;
    const minAmbientTemp = cityClimateData[cityKey] || 10;
    const efficiency = 0.85;
    
    // Potência total necessária
    const totalPower = (maxSimultaneousFlowLitersPerHour * (consumptionTempValue - minAmbientTemp)) / efficiency;
    
    // 70% da demanda
    const demand70Percent = totalPower * 0.7;
    
    // Área necessária (assumindo produção média de 600 kcal/h por m²)
    // Este valor pode ser ajustado conforme dados reais de produção solar
    const averageProductionPerM2 = 600; // kcal/h por m²
    const requiredArea = demand70Percent / averageProductionPerM2;
    
    setCalculatedRequiredArea(requiredArea);
    return requiredArea;
  };

  // Função para pré-selecionar quantidade de coletores mais próxima do cálculo
  const preselectSolarCollector = (requiredArea: number) => {
    if (!selectedSolarCollector && !solarCollectorCustom) {
      // Usar o coletor de área média como padrão
      const defaultCollector = mockSolarCollectors.find(c => c.area === 2.5) || mockSolarCollectors[1];
      setSelectedSolarCollector(defaultCollector.id);
      
      // Calcular quantidade baseada na área necessária
      const quantity = Math.ceil(requiredArea / defaultCollector.area);
      setSolarCollectorQuantity(quantity.toString());
    } else if (selectedSolarCollector) {
      // Se já tem um coletor selecionado, apenas atualizar a quantidade
      const collector = mockSolarCollectors.find(c => c.id === selectedSolarCollector);
      if (collector) {
        const quantity = Math.ceil(requiredArea / collector.area);
        setSolarCollectorQuantity(quantity.toString());
      }
    }
  };

  // Calcular potência quando os valores necessários mudarem
  useEffect(() => {
    if (selectedHeatingTypes.includes("Opção 02")) {
      // Recalcular vazão máxima simultânea primeiro
      const currentMaxFlow = calculateMaxSimultaneousFlow();
      
      if (currentMaxFlow > 0 && selectedCityResidential && (consumptionTempCustom || consumptionTemp)) {
        const power = calculateGasHeaterPower();
        if (power > 0 && !selectedGasHeater && !gasHeaterCustom) {
          preselectGasHeater(power);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedHeatingTypes,
    shower1Flow, shower1FlowCustom, shower1Quantity,
    shower2Flow, shower2FlowCustom, shower2Quantity,
    bathroomFlow, bathroomFlowCustom,
    bathtubFlow, bathtubFlowCustom,
    kitchenFlow, kitchenFlowCustom, kitchenQuantity,
    laundryFlow, laundryFlowCustom, laundryQuantity,
    consumptionTempCustom, consumptionTemp,
    selectedCityResidential
  ]);

  // Calcular área necessária para coletor solar quando os valores mudarem
  useEffect(() => {
    if (selectedHeatingTypes.includes("Opção 03")) {
      const currentMaxFlow = calculateMaxSimultaneousFlow();
      
      if (currentMaxFlow > 0 && selectedCityResidential && (consumptionTempCustom || consumptionTemp)) {
        const requiredArea = calculateRequiredSolarArea();
        if (requiredArea > 0) {
          preselectSolarCollector(requiredArea);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedHeatingTypes,
    shower1Flow, shower1FlowCustom, shower1Quantity,
    shower2Flow, shower2FlowCustom, shower2Quantity,
    bathroomFlow, bathroomFlowCustom,
    bathtubFlow, bathtubFlowCustom,
    kitchenFlow, kitchenFlowCustom, kitchenQuantity,
    laundryFlow, laundryFlowCustom, laundryQuantity,
    consumptionTempCustom, consumptionTemp,
    selectedCityResidential
  ]);

  // Atualizar quantidade quando coletor selecionado mudar e área necessária já estiver calculada
  useEffect(() => {
    if (selectedHeatingTypes.includes("Opção 03") && selectedSolarCollector && calculatedRequiredArea && calculatedRequiredArea > 0) {
      const collector = mockSolarCollectors.find(c => c.id === selectedSolarCollector);
      if (collector) {
        const quantity = Math.ceil(calculatedRequiredArea / collector.area);
        setSolarCollectorQuantity(quantity.toString());
      }
    }
  }, [selectedSolarCollector, calculatedRequiredArea, selectedHeatingTypes]);

  const resetForm = () => {
    setSegment(null);
    setSelectedClient("");
    setClientOpen(false);
    setIsNewClient(false);
    setNewClientName("");
    setNewClientPhone("");
    setNeedsInstallation(true);
    setNeedsProject(true);
    setConsumptionTemp("40");
    setConsumptionTempCustom("");
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
    setShower1Quantity("");
    setShower2Quantity("");
    setHasLajeStructure(false);
    setMaxSimultaneousFlow(0);
    setSelectedHeatingTypes([]);
    setSelectedEquipments({});
    setGasHeaterOpen(false);
    setSelectedGasHeater("");
    setGasHeaterCustom("");
    setGasHeaterQuantity("1");
    setHasCascadeSystem(false);
    setCalculatedPower(null);
    setSolarCollectorOpen(false);
    setSelectedSolarCollector("");
    setSolarCollectorCustom("");
    setSolarCollectorQuantity("1");
    setCollectorInclination("");
    setCollectorOrientation("");
    setCalculatedRequiredArea(null);
  };

  // Mutation para criar proposta
  const createProposalMutation = useMutation({
    mutationFn: (data: any) => api.createProposal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: 'Sucesso!',
        description: 'Proposta criada com sucesso',
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar proposta',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar proposta
  const updateProposalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateProposal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast({
        title: 'Sucesso!',
        description: 'Proposta atualizada com sucesso',
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar proposta',
        variant: 'destructive',
      });
    },
  });

  // Carregar dados da proposta quando estiver em modo de edição
  useEffect(() => {
    if (proposal && open) {
      // Carregar dados básicos
      setSegment(proposal.segment);
      
      // Cliente
      if (proposal.isNewClient) {
        setIsNewClient(true);
        setNewClientName(proposal.clientName || "");
        setNewClientPhone(proposal.clientPhone || "");
        setSelectedClient("");
      } else {
        setIsNewClient(false);
        setSelectedClient(proposal.clientId || "");
        setNewClientName("");
        setNewClientPhone("");
      }

      // Cidade
      if (proposal.segment === "piscina") {
        setSelectedCity(proposal.city || "");
      } else {
        setSelectedCityResidential(proposal.city || "");
      }

      // Carregar dados específicos do segmento
      const data = proposal.data || {};

      if (proposal.segment === "piscina") {
        // Dados da piscina
        setNeedsInstallation(data.needsInstallation ?? true);
        setNeedsProject(data.needsProject ?? true);
        setSelectedMonths(data.months || []);
        setUseFrequency(data.useFrequency || "");
        setDesiredTemp(data.desiredTemp || "");
        setIsEnclosed(data.isEnclosed || false);
        setEnclosedArea(data.enclosedArea || "");
        setIsSuspended(data.isSuspended || false);
        setPoolAreas(data.poolAreas || [{ id: 1, length: "", width: "", depth: "" }]);
        
        // Serviços adicionais
        if (data.additionalServices) {
          setHasFiltrationSystem(data.additionalServices.filtrationSystem || false);
          setHasLighting(data.additionalServices.lighting || false);
          setHasOzone(data.additionalServices.ozone || false);
          setHasChlorineGenerator(data.additionalServices.chlorineGenerator || false);
          setHasWaterfallService(data.additionalServices.waterfall || false);
        }

        // Cascata e borda infinita
        if (data.waterfall) {
          setHasWaterfall(true);
          setWaterfallHeight(data.waterfall.height || "");
          setWaterfallWidth(data.waterfall.width || "");
        }
        if (data.infinityEdge) {
          setHasInfinityEdge(true);
          setInfinityLength(data.infinityEdge.length || "");
          setInfinityHeight(data.infinityEdge.height || "");
          setInfinityWidth(data.infinityEdge.width || "");
        }
      } else if (proposal.segment === "residencial") {
        // Dados residenciais
        setNeedsInstallation(data.needsInstallation ?? true);
        setNeedsProject(data.needsProject ?? true);
        
        // Temperatura de consumo
        if (data.consumptionTemp) {
          setConsumptionTempCustom(data.consumptionTemp);
          setConsumptionTemp("");
        }

        // Chuveiros
        if (data.shower1) {
          setShower1FlowCustom(data.shower1.flow || "");
          setShower1TimeCustom(data.shower1.time || "");
          setShower1Quantity(data.shower1.quantity || "");
        }
        if (data.shower2) {
          setShower2FlowCustom(data.shower2.flow || "");
          setShower2TimeCustom(data.shower2.time || "");
          setShower2Quantity(data.shower2.quantity || "");
        }

        // Outros pontos
        if (data.bathroom) {
          setBathroomFlowCustom(data.bathroom.flow || "");
          setBathroomTimeCustom(data.bathroom.time || "");
        }
        if (data.bathtub) {
          setBathtubFlowCustom(data.bathtub.flow || "");
          setBathtubFrequencyCustom(data.bathtub.frequency || "");
        }
        if (data.kitchen) {
          setKitchenFlowCustom(data.kitchen.flow || "");
          setKitchenTimeCustom(data.kitchen.time || "");
          setKitchenQuantity(data.kitchen.quantity || 1);
        }
        if (data.laundry) {
          setLaundryFlowCustom(data.laundry.flow || "");
          setLaundryTimeCustom(data.laundry.time || "");
          setLaundryQuantity(data.laundry.quantity || 1);
        }

        // Sistemas adicionais
        if (data.networkCirculation?.enabled) {
          setHasNetworkCirculation(true);
          setNetworkCirculationQuantity(data.networkCirculation.quantity || "");
        }
        if (data.pressurizationSystem?.enabled) {
          setHasPressurizationSystem(true);
        }
        setHasLajeStructure(data.lajeStructure || false);

        // Tipos de sistemas de aquecimento
        if (data.heatingTypes) {
          setSelectedHeatingTypes(data.heatingTypes || []);
        }
        if (data.selectedEquipments) {
          setSelectedEquipments(data.selectedEquipments || {});
        }

        // Aquecedor a gás
        if (data.gasHeater) {
          setGasHeaterCustom(data.gasHeater.model || "");
          setGasHeaterQuantity(data.gasHeater.quantity?.toString() || "1");
          setHasCascadeSystem(data.gasHeater.cascadeSystem || false);
          if (data.gasHeater.calculatedPower) {
            setCalculatedPower(data.gasHeater.calculatedPower);
          }
        }

        // Coletor solar
        if (data.solarCollector) {
          setSolarCollectorCustom(data.solarCollector.model || "");
          setSolarCollectorQuantity(data.solarCollector.quantity?.toString() || "1");
          setCollectorInclination(data.solarCollector.inclination?.toString() || "");
          setCollectorOrientation(data.solarCollector.orientation?.toString() || "");
          if (data.solarCollector.calculatedRequiredArea) {
            setCalculatedRequiredArea(data.solarCollector.calculatedRequiredArea);
          }
        }

        // Vazão máxima
        if (data.maxSimultaneousFlow) {
          setMaxSimultaneousFlow(data.maxSimultaneousFlow);
        }
      }
    } else if (!proposal && open) {
      // Resetar formulário quando abrir para criar nova proposta
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal, open]);

  const handleSubmit = () => {
    // Validação básica
    if (isNewClient && (!newClientName || !newClientPhone)) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, preencha o nome e telefone do cliente',
        variant: 'destructive',
      });
      return;
    }

    if (!isNewClient && !selectedClient) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, selecione um cliente',
        variant: 'destructive',
      });
      return;
    }

    if (segment === "piscina") {
      if (!selectedCity) {
        toast({
          title: 'Erro de validação',
          description: 'Por favor, selecione a cidade',
          variant: 'destructive',
        });
        return;
      }

      const proposalData = {
        segment: "piscina" as const,
        client: isNewClient 
          ? { 
              isNew: true, 
              name: newClientName, 
              phone: newClientPhone 
            }
          : selectedClient ? { id: selectedClient } : undefined,
        city: selectedCity,
        data: {
          needsInstallation,
          needsProject,
          additionalServices: {
            filtrationSystem: hasFiltrationSystem,
            lighting: hasLighting,
            ozone: hasOzone,
            chlorineGenerator: hasChlorineGenerator,
            waterfall: hasWaterfallService,
          },
          months: selectedMonths,
          useFrequency,
          desiredTemp,
          isEnclosed,
          enclosedArea,
          poolSurfaceArea: calculatePoolSurfaceArea(),
          isSuspended,
          poolAreas,
          waterfall: hasWaterfall ? { height: waterfallHeight, width: waterfallWidth } : null,
          infinityEdge: hasInfinityEdge ? { length: infinityLength, height: infinityHeight, width: infinityWidth } : null,
        },
      };
      
      if (isEditMode && proposal) {
        updateProposalMutation.mutate({ id: proposal.id, data: proposalData });
      } else {
        createProposalMutation.mutate(proposalData);
      }
    } else if (segment === "residencial") {
      if (!selectedCityResidential) {
        toast({
          title: 'Erro de validação',
          description: 'Por favor, selecione a cidade',
          variant: 'destructive',
        });
        return;
      }

      const maxFlow = calculateMaxSimultaneousFlow();
      const proposalData = {
        segment: "residencial" as const,
        client: isNewClient 
          ? { 
              isNew: true, 
              name: newClientName, 
              phone: newClientPhone 
            }
          : selectedClient ? { id: selectedClient } : undefined,
        city: selectedCityResidential,
        data: {
          consumptionTemp: consumptionTempCustom || consumptionTemp,
          needsInstallation,
          needsProject,
          shower1: {
            flow: shower1FlowCustom || shower1Flow,
            time: shower1TimeCustom || shower1Time,
            quantity: shower1Quantity,
          },
          shower2: {
            flow: shower2FlowCustom || shower2Flow,
            time: shower2TimeCustom || shower2Time,
            quantity: shower2Quantity,
          },
          bathroom: {
            flow: bathroomFlowCustom || bathroomFlow,
            time: bathroomTimeCustom || bathroomTime,
          },
          bathtub: {
            flow: bathtubFlowCustom || bathtubFlow,
            frequency: bathtubFrequencyCustom || bathtubFrequency,
          },
          kitchen: {
            flow: kitchenFlowCustom || kitchenFlow,
            time: kitchenTimeCustom || kitchenTime,
            quantity: kitchenQuantity,
          },
          laundry: {
            flow: laundryFlowCustom || laundryFlow,
            time: laundryTimeCustom || laundryTime,
            quantity: laundryQuantity,
          },
          networkCirculation: hasNetworkCirculation ? {
            enabled: true,
            quantity: networkCirculationQuantity,
          } : { enabled: false },
          pressurizationSystem: hasPressurizationSystem ? {
            enabled: true,
          } : { enabled: false },
          lajeStructure: hasLajeStructure,
          maxSimultaneousFlow: maxFlow,
          maxSimultaneousFlowPerHour: maxFlow * 60,
          heatingTypes: selectedHeatingTypes,
          selectedEquipments: selectedEquipments,
          gasHeater: selectedHeatingTypes.includes("Opção 02") ? {
            model: gasHeaterCustom || (selectedGasHeater ? mockGasHeaters.find(h => h.id === selectedGasHeater)?.model : ""),
            quantity: parseInt(gasHeaterQuantity) || 1,
            calculatedPower: calculatedPower,
            cascadeSystem: hasCascadeSystem,
          } : null,
          solarCollector: selectedHeatingTypes.includes("Opção 03") ? {
            model: solarCollectorCustom || (selectedSolarCollector ? mockSolarCollectors.find(c => c.id === selectedSolarCollector)?.model : ""),
            quantity: parseInt(solarCollectorQuantity) || 1,
            calculatedRequiredArea: calculatedRequiredArea,
            inclination: collectorInclination ? parseFloat(collectorInclination) : null,
            orientation: collectorOrientation ? parseFloat(collectorOrientation) : null,
          } : null,
        },
      };
      
      if (isEditMode && proposal) {
        updateProposalMutation.mutate({ id: proposal.id, data: proposalData });
      } else {
        createProposalMutation.mutate(proposalData);
      }
    }
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
            <div className="space-y-2">
              <Label>Cliente:</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="w-full justify-between"
                  >
                    {isNewClient
                      ? newClientName || "Novo cliente..."
                      : selectedClient
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
                        <CommandItem
                          value="novo-cliente"
                          onSelect={() => {
                            setIsNewClient(true);
                            setSelectedClient("");
                            setClientOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">➕</span>
                            <span className="font-semibold">Cadastrar novo cliente</span>
                          </div>
                        </CommandItem>
                        {mockClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.name} ${client.email}`}
                            onSelect={() => {
                              setSelectedClient(client.id === selectedClient ? "" : client.id);
                              setIsNewClient(false);
                              setNewClientName("");
                              setNewClientPhone("");
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
              
              {isNewClient && (
                <div className="space-y-3 mt-4 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <div className="space-y-2">
                    <Label htmlFor="new-client-name">Nome do Cliente *</Label>
                    <Input
                      id="new-client-name"
                      placeholder="Digite o nome do cliente"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-client-phone">Telefone *</Label>
                    <Input
                      id="new-client-phone"
                      placeholder="(00) 00000-0000"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            </div>

          <Separator />

          {/* Seção 1: Local de Instalação */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cidade / Estado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione a cidade da instalacao dos equipamentos
              </p>
            </div>
            <div className="space-y-2">
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
                    <SelectItem value="diario">Uso Diário</SelectItem>
                    <SelectItem value="esporadico">Uso Esporádico</SelectItem>
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

          {/* Seção 4: Dimensões das Áreas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">4. Dimensões da Piscina</h3>
                      <p className="text-sm text-muted-foreground">
                  Adicione as áreas da piscina
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
                          value={area.length}
                          onChange={(e) => updatePoolArea(area.id, "length", e.target.value)}
                      />
                    </div>
                      <div className="space-y-2">
                        <Label>Largura (m)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={area.width}
                          onChange={(e) => updatePoolArea(area.id, "width", e.target.value)}
                        />
                    </div>
                      <div className="space-y-2">
                        <Label>Profundidade (m)</Label>
                        <Input
                          type="number"
                          step="0.01"
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

          {/* Seção 5: Características Especiais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">5. Características Especiais</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recursos adicionais da piscina
              </p>
            </div>

            <div className="space-y-4">
              {/* Tipo de Ambiente */}
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

                    {enclosedArea && poolAreas.some(area => area.length && area.width) && (
                      <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700">
                        <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                          ✅ Desumidificadores necessários:
                        </p>
                        <p className="text-sm font-bold text-green-900 dark:text-green-100 mt-1">
                          {Math.ceil(Math.max(
                            calculatePoolSurfaceArea() / 50,
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

          {/* Seção 6: Serviços Adicionais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Selecione os adicionais</h3>
            </div>
            <div className="space-y-3">
              {/* Projetos */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <Checkbox
                  id="project-piscina"
                  checked={needsProject}
                  onCheckedChange={(checked) => setNeedsProject(checked as boolean)}
                />
                <Label htmlFor="project-piscina" className="cursor-pointer font-semibold">
                  📐 Projetos
                </Label>
              </div>

              {/* Serviço de Instalação */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <Checkbox
                  id="installation-piscina"
                  checked={needsInstallation}
                  onCheckedChange={(checked) => setNeedsInstallation(checked as boolean)}
                />
                <Label htmlFor="installation-piscina" className="cursor-pointer font-semibold">
                  🔧 Serviços de Instalação
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
            <div className="space-y-2">
              <Label>Cliente:</Label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientOpen}
                    className="w-full justify-between"
                  >
                    {isNewClient
                      ? newClientName || "Novo cliente..."
                      : selectedClient
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
                        <CommandItem
                          value="novo-cliente"
                          onSelect={() => {
                            setIsNewClient(true);
                            setSelectedClient("");
                            setClientOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">➕</span>
                            <span className="font-semibold">Cadastrar novo cliente</span>
                  </div>
                        </CommandItem>
                        {mockClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.name} ${client.email}`}
                            onSelect={() => {
                              setSelectedClient(client.id === selectedClient ? "" : client.id);
                              setIsNewClient(false);
                              setNewClientName("");
                              setNewClientPhone("");
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
              
              {isNewClient && (
                <div className="space-y-3 mt-4 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <div className="space-y-2">
                    <Label htmlFor="new-client-name-res">Nome do Cliente *</Label>
                    <Input
                      id="new-client-name-res"
                      placeholder="Digite o nome do cliente"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-client-phone-res">Telefone *</Label>
                    <Input
                      id="new-client-phone-res"
                      placeholder="(00) 00000-0000"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                    />
                  </div>
              </div>
            )}
            </div>
          </div>

          <Separator />

          {/* Seção 0.5: Cidade */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Cidade / Estado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione a cidade da instalacao dos equipamentos
              </p>
            </div>
            <div className="space-y-2">
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
            </div>
            </div>

          <Separator />

          {/* Seção 1: Banheiros */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Banheiros</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure um vazão e tempo de utilização dos equipamentos banheiro
                      </p>
                    </div>

            {/* Chuveiro 01 */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <h4 className="font-semibold text-base mb-3">🚿 Chuveiro 01</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shower1-flow">Vazão (L/min) *</Label>
                  <Input
                    id="shower1-flow"
                    type="number"
                    step="0.1"
                    placeholder="Digite a vazão"
                    value={shower1FlowCustom || shower1Flow}
                    onChange={(e) => {
                      setShower1FlowCustom(e.target.value);
                      setShower1Flow("");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shower1-time">Tempo de Utilização (min) *</Label>
                  <Input
                    id="shower1-time"
                    type="number"
                    step="0.1"
                    placeholder="Digite o tempo"
                    value={shower1TimeCustom || shower1Time}
                    onChange={(e) => {
                      setShower1TimeCustom(e.target.value);
                      setShower1Time("");
                    }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="shower1-quantity" className="text-sm font-medium">
                    Quantidade (Simultaneidade) *
                  </Label>
                  <Input
                    id="shower1-quantity"
                    type="number"
                    min="1"
                    placeholder="Digite a quantidade de chuveiros simultâneos"
                    value={shower1Quantity}
                    onChange={(e) => setShower1Quantity(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade de chuveiros que podem ser utilizados simultaneamente
                  </p>
                </div>
              </div>
            </div>

            {/* Chuveiro 02 */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <h4 className="font-semibold text-base mb-3">🚿 Chuveiro 02</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shower2-flow">Vazão (L/min) *</Label>
                  <Input
                    id="shower2-flow"
                    type="number"
                    step="0.1"
                    placeholder="Digite a vazão"
                    value={shower2FlowCustom || shower2Flow}
                    onChange={(e) => {
                      setShower2FlowCustom(e.target.value);
                      setShower2Flow("");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shower2-time">Tempo de Utilização (min) *</Label>
                  <Input
                    id="shower2-time"
                    type="number"
                    step="0.1"
                    placeholder="Digite o tempo"
                    value={shower2TimeCustom || shower2Time}
                    onChange={(e) => {
                      setShower2TimeCustom(e.target.value);
                      setShower2Time("");
                    }}
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="shower2-quantity" className="text-sm font-medium">
                    Quantidade (Simultaneidade) *
                  </Label>
                  <Input
                    id="shower2-quantity"
                    type="number"
                    min="1"
                    placeholder="Digite a quantidade de chuveiros simultâneos"
                    value={shower2Quantity}
                    onChange={(e) => setShower2Quantity(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade de chuveiros que podem ser utilizados simultaneamente
                  </p>
                </div>
              </div>
            </div>

            {/* Torneiras Banheiro */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <h4 className="font-semibold text-base mb-3">💧 Torneiras</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathroom-flow">Vazão (L/min) *</Label>
                  <Input
                    id="bathroom-flow"
                    type="number"
                    step="0.1"
                    placeholder="Digite a vazão"
                    value={bathroomFlowCustom || bathroomFlow}
                    onChange={(e) => {
                      setBathroomFlowCustom(e.target.value);
                      setBathroomFlow("");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathroom-time">Tempo de Utilização (min) *</Label>
                  <Input
                    id="bathroom-time"
                    type="number"
                    step="0.1"
                    placeholder="Digite o tempo"
                    value={bathroomTimeCustom || bathroomTime}
                    onChange={(e) => {
                      setBathroomTimeCustom(e.target.value);
                      setBathroomTime("");
                    }}
                  />
                </div>
            </div>
          </div>

            {/* Banheira */}
            <div className="space-y-4 p-4 rounded-lg border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <h4 className="font-semibold text-base mb-3">🛁 Banheira</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathtub-flow">Capacidade (litros)</Label>
                  <Input
                    id="bathtub-flow"
                    type="number"
                    step="0.1"
                    placeholder="Capacidade (Litros)"
                    value={bathtubFlowCustom || bathtubFlow}
                    onChange={(e) => {
                      setBathtubFlowCustom(e.target.value);
                      setBathtubFlow("");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathtub-freq">Frequência de uso na semana</Label>
                  <Input
                    id="bathtub-freq"
                    type="number"
                    step="0.1"
                    placeholder="Digite a frequência"
                    value={bathtubFrequencyCustom || bathtubFrequency}
                    onChange={(e) => {
                      setBathtubFrequencyCustom(e.target.value);
                      setBathtubFrequency("");
                    }}
                  />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kitchen-flow">Vazão das Torneiras (L/min) *</Label>
                <Input
                  id="kitchen-flow"
                  type="number"
                  step="0.1"
                  placeholder="Digite a vazão"
                  value={kitchenFlowCustom || kitchenFlow}
                  onChange={(e) => {
                    setKitchenFlowCustom(e.target.value);
                    setKitchenFlow("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kitchen-time">Tempo de Utilização (min) *</Label>
                <Input
                  id="kitchen-time"
                  type="number"
                  step="0.1"
                  placeholder="Digite o tempo"
                  value={kitchenTimeCustom || kitchenTime}
                  onChange={(e) => {
                    setKitchenTimeCustom(e.target.value);
                    setKitchenTime("");
                  }}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laundry-flow">Vazão das Torneiras (L/min) *</Label>
                <Input
                  id="laundry-flow"
                  type="number"
                  step="0.1"
                  placeholder="Digite a vazão"
                  value={laundryFlowCustom || laundryFlow}
                  onChange={(e) => {
                    setLaundryFlowCustom(e.target.value);
                    setLaundryFlow("");
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laundry-time">Tempo de Utilização (min) *</Label>
                <Input
                  id="laundry-time"
                  type="number"
                  step="0.1"
                  placeholder="Digite o tempo"
                  value={laundryTimeCustom || laundryTime}
                  onChange={(e) => {
                    setLaundryTimeCustom(e.target.value);
                    setLaundryTime("");
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Seleção de Temperatura de Consumo */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Seleção Temperatura de Consumo</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumption-temp-res">Temperatura de Consumo (°C) *</Label>
              <Input
                id="consumption-temp-res"
                type="number"
                step="0.1"
                placeholder="Digite a temperatura de consumo"
                value={consumptionTempCustom || consumptionTemp}
                onChange={(e) => {
                  setConsumptionTempCustom(e.target.value);
                  setConsumptionTemp("");
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Seção 4: Seleção de Tipos de Sistemas de Aquecimento */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Seleção de Tipos de Sistemas de Aquecimento</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione um ou mais tipos de sistemas de aquecimento (é possível marcar mais de uma opção)
              </p>
            </div>
            
            <div className="space-y-3">
              {/* Opção 01 - Elétrico c/ resistência */}
              <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="heating-type-01"
                    checked={selectedHeatingTypes.includes("Opção 01")}
                    onCheckedChange={() => toggleHeatingType("Opção 01")}
                  />
                  <Label htmlFor="heating-type-01" className="cursor-pointer font-semibold">
                    Opção 01 - Elétrico c/ resistência
                  </Label>
                </div>
                {selectedHeatingTypes.includes("Opção 01") && (
                  <div className="ml-6 mt-4 space-y-3">
                    <Label className="text-sm font-medium">Selecione os equipamentos:</Label>
                    {isLoadingProducts ? (
                      <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-muted-foreground">Carregando equipamentos...</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        {getEquipmentsByHeatingType("Opção 01").length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Nenhum equipamento disponível. Cadastre produtos na categoria "Equipamentos" para este tipo de sistema.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {getEquipmentsByHeatingType("Opção 01").map((equipment) => {
                              const isSelected = selectedEquipments["Opção 01"]?.includes(equipment.id) || false;
                              return (
                                <div
                                  key={equipment.id}
                                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <Checkbox
                                    id={`equipment-01-${equipment.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleEquipment("Opção 01", equipment.id)}
                                  />
                                  <Label
                                    htmlFor={`equipment-01-${equipment.id}`}
                                    className="cursor-pointer flex-1"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{equipment.description}</span>
                                      {equipment.code && (
                                        <span className="text-xs text-muted-foreground">
                                          Código: {equipment.code}
                                        </span>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Opção 02 - Aquecedor a GÁS */}
              <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="heating-type-02"
                    checked={selectedHeatingTypes.includes("Opção 02")}
                    onCheckedChange={() => toggleHeatingType("Opção 02")}
                  />
                  <Label htmlFor="heating-type-02" className="cursor-pointer font-semibold">
                    Opção 02 - Aquecedor a GÁS
                  </Label>
                </div>
                {selectedHeatingTypes.includes("Opção 02") && (
                  <div className="ml-6 mt-4 space-y-4">
                    {/* Cálculo de Potência */}
                    {calculatedPower !== null && calculatedPower > 0 && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Potência Calculada:
                        </p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                          {calculatedPower.toFixed(2)} kcal/h
                        </p>
                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <p className="font-medium">Fórmula: E_total = V_simultâneo × (T_consumo - T_ambiente_mínima) ÷ eficiência</p>
                          <p>
                            V_simultâneo: {(maxSimultaneousFlow * 60).toFixed(2)} L/h | 
                            T_consumo: {parseFloat(consumptionTempCustom || consumptionTemp) || 40}°C | 
                            T_ambiente_mínima: {cityClimateData[selectedCityResidential] || 10}°C | 
                            Eficiência: 0.85
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Seleção do Modelo de Aquecedor a Gás */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Selecione o modelo do aquecedor a gás:</Label>
                      
                      <Popover open={gasHeaterOpen} onOpenChange={setGasHeaterOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={gasHeaterOpen}
                            className="w-full justify-between"
                          >
                            {gasHeaterCustom
                              ? gasHeaterCustom
                              : selectedGasHeater
                              ? mockGasHeaters.find((heater) => heater.id === selectedGasHeater)?.model
                              : "Selecione ou digite o modelo..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar aquecedor ou digite..." />
                            <CommandList>
                              <CommandEmpty>
                                <div className="p-2">
                                  <p className="text-sm mb-2">Nenhum aquecedor encontrado.</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                      setGasHeaterCustom("");
                                      setSelectedGasHeater("");
                                      setGasHeaterOpen(false);
                                    }}
                                  >
                                    Digitar modelo manualmente
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="novo-produto"
                                  onSelect={() => {
                                    // TODO: Abrir modal de cadastro de produto (apenas para admin)
                                    console.log("Abrir modal de cadastro de novo produto");
                                    setGasHeaterOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span className="font-semibold">Cadastrar novo produto</span>
                                  </div>
                                </CommandItem>
                                {mockGasHeaters.map((heater) => (
                                  <CommandItem
                                    key={heater.id}
                                    value={`${heater.model} ${heater.power} kcal/h`}
                                    onSelect={() => {
                                      setSelectedGasHeater(heater.id === selectedGasHeater ? "" : heater.id);
                                      setGasHeaterCustom("");
                                      setGasHeaterOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedGasHeater === heater.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{heater.model}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {heater.power.toLocaleString()} kcal/h
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Opção para digitar manualmente */}
                      {!selectedGasHeater && (
                        <div className="space-y-2">
                          <Label htmlFor="gas-heater-custom">Ou digite o modelo:</Label>
                          <Input
                            id="gas-heater-custom"
                            placeholder="Digite o modelo do aquecedor"
                            value={gasHeaterCustom}
                            onChange={(e) => {
                              setGasHeaterCustom(e.target.value);
                              setSelectedGasHeater("");
                            }}
                          />
                        </div>
                      )}

                      {/* Quantidade */}
                      <div className="space-y-2">
                        <Label htmlFor="gas-heater-quantity">Quantidade:</Label>
                        <Input
                          id="gas-heater-quantity"
                          type="number"
                          min="1"
                          placeholder="Digite a quantidade"
                          value={gasHeaterQuantity}
                          onChange={(e) => setGasHeaterQuantity(e.target.value)}
                        />
                      </div>

                      {/* Sistema Cascata (Opcional) */}
                      <div className="flex items-center space-x-2 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <Checkbox
                          id="cascade-system"
                          checked={hasCascadeSystem}
                          onCheckedChange={(checked) => setHasCascadeSystem(checked as boolean)}
                        />
                        <Label htmlFor="cascade-system" className="cursor-pointer font-medium">
                          Sistema Cascata (Opcional)
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Opção 03 - Solar */}
              <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="heating-type-03"
                    checked={selectedHeatingTypes.includes("Opção 03")}
                    onCheckedChange={() => toggleHeatingType("Opção 03")}
                  />
                  <Label htmlFor="heating-type-03" className="cursor-pointer font-semibold">
                    Opção 03 - Solar
                  </Label>
                </div>
                {selectedHeatingTypes.includes("Opção 03") && (
                  <div className="ml-6 mt-4 space-y-4">
                    {/* Cálculo de Área Necessária (70% demanda) */}
                    {calculatedRequiredArea !== null && calculatedRequiredArea > 0 && (
                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                          Área Necessária (70% da demanda):
                        </p>
                        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                          {calculatedRequiredArea.toFixed(2)} m²
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          Cálculo baseado em 70% da demanda total de energia
                        </p>
                      </div>
                    )}

                    {/* Seleção do Modelo do Coletor Solar */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Selecione o modelo do coletor solar:</Label>
                      
                      <Popover open={solarCollectorOpen} onOpenChange={setSolarCollectorOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={solarCollectorOpen}
                            className="w-full justify-between"
                          >
                            {solarCollectorCustom
                              ? solarCollectorCustom
                              : selectedSolarCollector
                              ? mockSolarCollectors.find((collector) => collector.id === selectedSolarCollector)?.model
                              : "Selecione ou digite o modelo..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar coletor ou digite..." />
                            <CommandList>
                              <CommandEmpty>
                                <div className="p-2">
                                  <p className="text-sm mb-2">Nenhum coletor encontrado.</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                      setSolarCollectorCustom("");
                                      setSelectedSolarCollector("");
                                      setSolarCollectorOpen(false);
                                    }}
                                  >
                                    Digitar modelo manualmente
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="novo-produto-solar"
                                  onSelect={() => {
                                    // TODO: Abrir modal de cadastro de produto (apenas para admin)
                                    console.log("Abrir modal de cadastro de novo produto solar");
                                    setSolarCollectorOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span className="font-semibold">Cadastrar novo produto</span>
                                  </div>
                                </CommandItem>
                                {mockSolarCollectors.map((collector) => (
                                  <CommandItem
                                    key={collector.id}
                                    value={`${collector.model} ${collector.area} m²`}
                                    onSelect={() => {
                                      setSelectedSolarCollector(collector.id === selectedSolarCollector ? "" : collector.id);
                                      setSolarCollectorCustom("");
                                      setSolarCollectorOpen(false);
                                      // Recalcular quantidade se área necessária já foi calculada
                                      if (calculatedRequiredArea && calculatedRequiredArea > 0) {
                                        const quantity = Math.ceil(calculatedRequiredArea / collector.area);
                                        setSolarCollectorQuantity(quantity.toString());
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedSolarCollector === collector.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{collector.model}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {collector.area} m² {collector.production ? `| ${collector.production} kcal/h` : ""}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Opção para digitar manualmente */}
                      {!selectedSolarCollector && (
                        <div className="space-y-2">
                          <Label htmlFor="solar-collector-custom">Ou digite o modelo:</Label>
                          <Input
                            id="solar-collector-custom"
                            placeholder="Digite o modelo do coletor"
                            value={solarCollectorCustom}
                            onChange={(e) => {
                              setSolarCollectorCustom(e.target.value);
                              setSelectedSolarCollector("");
                            }}
                          />
                        </div>
                      )}

                      {/* Quantidade */}
                      <div className="space-y-2">
                        <Label htmlFor="solar-collector-quantity">Quantidade:</Label>
                        <Input
                          id="solar-collector-quantity"
                          type="number"
                          min="1"
                          placeholder="Digite a quantidade"
                          value={solarCollectorQuantity}
                          onChange={(e) => setSolarCollectorQuantity(e.target.value)}
                        />
                        {selectedSolarCollector && calculatedRequiredArea && (
                          <p className="text-xs text-muted-foreground">
                            Área total: {(parseFloat(solarCollectorQuantity) || 1) * (mockSolarCollectors.find(c => c.id === selectedSolarCollector)?.area || 0)} m²
                          </p>
                        )}
                      </div>

                      {/* Inclinação do Coletor */}
                      <div className="space-y-2">
                        <Label htmlFor="collector-inclination">Inclinação do coletor (graus):</Label>
                        <Input
                          id="collector-inclination"
                          type="number"
                          step="0.1"
                          placeholder="Digite a inclinação em graus"
                          value={collectorInclination}
                          onChange={(e) => setCollectorInclination(e.target.value)}
                        />
                      </div>

                      {/* Orientação do Local de Instalação */}
                      <div className="space-y-2">
                        <Label htmlFor="collector-orientation">Orientação do local de instalação em relação ao norte geográfico (graus):</Label>
                        <Input
                          id="collector-orientation"
                          type="number"
                          step="0.1"
                          placeholder="Digite a orientação em graus (0° = Norte)"
                          value={collectorOrientation}
                          onChange={(e) => setCollectorOrientation(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Ex: 0° = Norte, 90° = Leste, 180° = Sul, 270° = Oeste
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Opção 04 - (seleciona automaticamente Opção 01) */}
              <div className="p-4 rounded-lg border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="heating-type-04"
                    checked={selectedHeatingTypes.includes("Opção 04")}
                    onCheckedChange={() => toggleHeatingType("Opção 04")}
                  />
                  <Label htmlFor="heating-type-04" className="cursor-pointer font-semibold">
                    Opção 04
                  </Label>
                </div>
                {selectedHeatingTypes.includes("Opção 04") && (
                  <div className="ml-6 mt-2">
                    <p className="text-xs text-muted-foreground italic">
                      * Ao selecionar a opção 04, a opção 01 é selecionada automaticamente
                    </p>
                  </div>
                )}
                {selectedHeatingTypes.includes("Opção 04") && (
                  <div className="ml-6 mt-4 space-y-3">
                    <Label className="text-sm font-medium">Selecione os equipamentos:</Label>
                    {isLoadingProducts ? (
                      <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-muted-foreground">Carregando equipamentos...</p>
                      </div>
                    ) : (
                      <div className="space-y-2 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        {getEquipmentsByHeatingType("Opção 04").length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Nenhum equipamento disponível. Cadastre produtos na categoria "Equipamentos" para este tipo de sistema.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {getEquipmentsByHeatingType("Opção 04").map((equipment) => {
                              const isSelected = selectedEquipments["Opção 04"]?.includes(equipment.id) || false;
                              return (
                                <div
                                  key={equipment.id}
                                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <Checkbox
                                    id={`equipment-04-${equipment.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleEquipment("Opção 04", equipment.id)}
                                  />
                                  <Label
                                    htmlFor={`equipment-04-${equipment.id}`}
                                    className="cursor-pointer flex-1"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{equipment.description}</span>
                                      {equipment.code && (
                                        <span className="text-xs text-muted-foreground">
                                          Código: {equipment.code}
                                        </span>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Seção 5: Serviços Adicionais */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Selecione os adicionais</h3>
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

              {/* Serviço de Instalação */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <Checkbox
                  id="installation-res"
                  checked={needsInstallation}
                  onCheckedChange={(checked) => setNeedsInstallation(checked as boolean)}
                />
                <Label htmlFor="installation-res" className="cursor-pointer font-semibold">
                  🔧 Serviço de Instalação
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
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                <Checkbox
                  id="pressurization-system"
                  checked={hasPressurizationSystem}
                  onCheckedChange={(checked) => setHasPressurizationSystem(checked as boolean)}
                />
                <Label htmlFor="pressurization-system" className="cursor-pointer font-semibold">
                  💧 Sistema de Pressurização
                </Label>
              </div>

              {/* Estrutura para Laje */}
              <div className="flex items-center space-x-2 p-4 rounded-lg border-2 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
                <Checkbox
                  id="laje-structure"
                  checked={hasLajeStructure}
                  onCheckedChange={(checked) => setHasLajeStructure(checked as boolean)}
                />
                <Label htmlFor="laje-structure" className="cursor-pointer font-semibold">
                  🏗️ Estrutura para laje
                </Label>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode 
              ? `Editar Proposta - ${proposal?.segment === "piscina" ? "Piscina" : "Residencial"}`
              : !segment ? "Nova Proposta - Selecione a Segmentação" : 
             segment === "piscina" ? "Proposta Piscina" :
             "Proposta residencial"}
          </DialogTitle>
          {segment !== "residencial" && (
            <DialogDescription>
              {!segment ? "Escolha o tipo de proposta que deseja criar" :
               segment === "piscina" ? "" :
               ""}
            </DialogDescription>
          )}
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
            <Button 
              onClick={handleSubmit}
              disabled={createProposalMutation.isPending || updateProposalMutation.isPending}
            >
              {createProposalMutation.isPending || updateProposalMutation.isPending 
                ? (isEditMode ? "Salvando..." : "Criando...") 
                : (isEditMode ? "Salvar Alterações" : "Criar Proposta")}
          </Button>
          )}

          {segment === "residencial" && (
            <Button 
              onClick={handleSubmit}
              disabled={createProposalMutation.isPending || updateProposalMutation.isPending}
            >
              {createProposalMutation.isPending || updateProposalMutation.isPending 
                ? (isEditMode ? "Salvando..." : "Criando...") 
                : (isEditMode ? "Salvar Alterações" : "Criar Proposta")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
                                          