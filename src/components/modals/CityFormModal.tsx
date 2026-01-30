import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Plus, X, Loader2 } from "lucide-react";
import { api, CreateCityRequest, City, MonthlyData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface CityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  city?: City | null;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function CityFormModal({ open, onOpenChange, city }: CityFormModalProps) {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [monthlyData, setMonthlyData] = useState<Array<{
    month: string;
    temperature: string;
    solarRadiation: string;
    windSpeed: string;
  }>>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (city && open) {
      setName(city.name);
      setLatitude(city.latitude.toString());

      // Criar mapa dos dados existentes
      const existingData = new Map(
        city.monthlyData.map(data => [data.month, data])
      );

      // Preencher todos os 12 meses, usando dados existentes ou vazio
      const fullData = months.map(month => {
        const existing = existingData.get(month);
        return {
          month,
          temperature: existing?.temperature?.toString() || "",
          solarRadiation: existing?.solarRadiation?.toString() || "",
          windSpeed: existing?.windSpeed?.toString() || "",
        };
      });

      setMonthlyData(fullData);
    } else if (!city && open) {
      setName("");
      setLatitude("");
      // Inicializar com 12 meses vazios
      setMonthlyData(months.map(month => ({
        month,
        temperature: "",
        solarRadiation: "",
        windSpeed: ""
      })));
    }
  }, [city, open]);

  const createMutation = useMutation({
    mutationFn: (data: CreateCityRequest) => api.createCity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast({
        title: 'Sucesso!',
        description: 'Cidade criada com sucesso',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCityRequest> }) =>
      api.updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast({
        title: 'Sucesso!',
        description: 'Cidade atualizada com sucesso',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMonthlyData = (index: number, field: string, value: string) => {
    const updated = [...monthlyData];
    updated[index] = { ...updated[index], [field]: value };
    setMonthlyData(updated);
  };

  const handleSubmit = () => {
    if (!name.trim() || !latitude.trim()) {
      toast({
        title: 'Erro na validação',
        description: 'Nome e latitude são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    // Filtrar apenas meses preenchidos
    const filledMonths = monthlyData.filter(
      data => data.temperature && data.solarRadiation && data.windSpeed
    );

    if (filledMonths.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Nenhum mês foi preenchido. A cidade será criada sem dados climáticos.',
        variant: 'default',
      });
    }

    const cityData: CreateCityRequest = {
      name: name.trim(),
      latitude: parseFloat(latitude),
      monthlyData: filledMonths.map((data) => ({
        month: data.month,
        temperature: parseFloat(data.temperature),
        solarRadiation: parseFloat(data.solarRadiation),
        windSpeed: parseFloat(data.windSpeed),
      })),
    };

    if (city) {
      updateMutation.mutate({ id: city.id, data: cityData });
    } else {
      createMutation.mutate(cityData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{city ? 'Editar Cidade' : 'Nova Cidade'}</DialogTitle>
          <DialogDescription>
            {city ? 'Atualize os dados da cidade' : 'Cadastre os dados climáticos mensais da cidade'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-accent">
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                <span className="font-semibold">
                  {name || "Dados da Cidade"}
                </span>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4 space-y-4 rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Cidade *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: São Paulo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="Ex: -23.550520"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dados Mensais (12 Meses)</Label>
            </div>

            {monthlyData.map((data, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-primary">{data.month}</Label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Temperatura (°C) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 22.5"
                      value={data.temperature}
                      onChange={(e) => updateMonthlyData(index, 'temperature', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Radiação Solar (kWh/m²) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 5.2"
                      value={data.solarRadiation}
                      onChange={(e) => updateMonthlyData(index, 'solarRadiation', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Velocidade do Vento (km/h) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 12.6"
                      value={data.windSpeed}
                      onChange={(e) => updateMonthlyData(index, 'windSpeed', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {city ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              city ? 'Salvar Alterações' : 'Cadastrar Cidade'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
