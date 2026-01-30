import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { CityFormModal } from "@/components/modals/CityFormModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { api, City } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const calculateAverage = (data: (number | string)[]) => {
  if (!data || data.length === 0) return "0.00";
  const validNumbers = data.map(n => parseFloat(n.toString())).filter(n => !isNaN(n));
  if (validNumbers.length === 0) return "0.00";
  return (validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length).toFixed(2);
};

export default function Cities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: cities = [], isLoading, error } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: () => api.getCities(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast({
        title: 'Sucesso!',
        description: 'Cidade removida com sucesso',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleOpenModal = (city?: City) => {
    if (city) {
      setEditingCity(city);
    } else {
      setEditingCity(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCity(null);
    queryClient.invalidateQueries({ queryKey: ['cities'] });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta cidade?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cidades</h1>
            <p className="text-muted-foreground">Gerencie as cidades e seus dados climáticos mensais</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando cidades...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cidades</h1>
            <p className="text-muted-foreground">Gerencie as cidades e seus dados climáticos mensais</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar cidades</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['cities'] })}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cidades</h1>
          <p className="text-muted-foreground">Gerencie as cidades e seus dados climáticos mensais</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Nova Cidade
        </Button>
      </div>

      <div className="space-y-2">
        {cities.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Nenhuma cidade cadastrada. Clique em "Nova Cidade" para começar.
          </div>
        ) : (
          cities.map((city) => {
            const avgTemp = calculateAverage(city.monthlyData.map(m => m.temperature));
            const avgSolarRadiation = calculateAverage(city.monthlyData.map(m => m.solarRadiation));
            const avgWindSpeed = calculateAverage(city.monthlyData.map(m => m.windSpeed));
            const isExpanded = expandedCity === city.id;

            return (
              <Collapsible
                key={city.id}
                open={isExpanded}
                onOpenChange={() => setExpandedCity(isExpanded ? null : city.id)}
              >
                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 cursor-pointer flex-1">
                        <ChevronRight
                          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <div className="text-left">
                          <div className="font-semibold text-lg">{city.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {city.monthlyData.length} meses cadastrados
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <div className="flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Temp. Média</div>
                        <div className="font-semibold">{avgTemp}°C</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Radiação Solar</div>
                        <div className="font-semibold">{avgSolarRadiation} kWh/m²</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Vento Médio</div>
                        <div className="font-semibold">{avgWindSpeed} km/h</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(city)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(city.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mês</TableHead>
                            <TableHead>Temperatura (°C)</TableHead>
                            <TableHead>Radiação Solar (kWh/m²)</TableHead>
                            <TableHead>Latitude</TableHead>
                            <TableHead>Velocidade Vento (km/h)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {city.monthlyData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                Nenhum dado mensal cadastrado
                              </TableCell>
                            </TableRow>
                          ) : (
                            city.monthlyData.map((data) => (
                              <TableRow key={data.id || data.month}>
                                <TableCell className="font-medium">{data.month}</TableCell>
                                <TableCell>{data.temperature}°C</TableCell>
                                <TableCell>{data.solarRadiation}</TableCell>
                                <TableCell>{city.latitude}</TableCell>
                                <TableCell>{data.windSpeed}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })
        )}
      </div>

      <CityFormModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        city={editingCity}
      />
    </div>
  );
}
