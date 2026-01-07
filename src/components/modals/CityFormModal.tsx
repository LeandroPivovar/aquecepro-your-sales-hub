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
      setMonthlyData(
        city.monthlyData.map((data) => ({
          month: data.month,
          temperature: data.temperature.toString(),
          solarRadiation: data.solarRadiation.toString(),
          windSpeed: data.windSpeed.toString(),
        }))
      );
    } else if (!city && open) {
      setName("");
      setLatitude("");
      setMonthlyData([]);
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

  const addMonthlyData = () => {
    setMonthlyData([
      ...monthlyData,
      { month: "", temperature: "", solarRadiation: "", windSpeed: "" }
    ]);
  };

  const removeMonthlyData = (index: number) => {
    setMonthlyData(monthlyData.filter((_, i) => i !== index));
  };

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

    const cityData: CreateCityRequest = {
      name: name.trim(),
      latitude: parseFloat(latitude),
      monthlyData: monthlyData
        .filter((data) => data.month && data.temperature && data.solarRadiation && data.windSpeed)
        .map((data) => ({
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
              <Label>Dados Mensais</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMonthlyData}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Mês
              </Button>
            </div>

            {monthlyData.map((data, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Dados do Mês {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMonthlyData(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mês *</Label>
                    <Select
                      value={data.month}
                      onValueChange={(value) => updateMonthlyData(index, 'month', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                    <Label>Velocidade do Vento (m/s) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 3.5"
                      value={data.windSpeed}
                      onChange={(e) => updateMonthlyData(index, 'windSpeed', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            ))}

            {monthlyData.length === 0 && (
              <div className="text-center text-muted-foreground py-8 border rounded-lg">
                Nenhum dado mensal adicionado. Clique em "Adicionar Mês" para começar.
              </div>
            )}
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
