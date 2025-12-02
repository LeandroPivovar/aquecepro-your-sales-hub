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
import { Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import { CityFormModal } from "@/components/modals/CityFormModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mockCities = [
  {
    id: 1,
    name: "São Paulo",
    monthlyData: [
      { month: "Janeiro", temperature: 24.5, solarRadiation: 5.2, latitude: -23.550520, windSpeed: 3.5 },
      { month: "Fevereiro", temperature: 25.1, solarRadiation: 5.5, latitude: -23.550520, windSpeed: 3.2 },
      { month: "Março", temperature: 24.0, solarRadiation: 5.0, latitude: -23.550520, windSpeed: 3.0 },
      { month: "Abril", temperature: 22.0, solarRadiation: 4.8, latitude: -23.550520, windSpeed: 2.8 },
      { month: "Maio", temperature: 19.5, solarRadiation: 4.2, latitude: -23.550520, windSpeed: 2.5 },
      { month: "Junho", temperature: 18.0, solarRadiation: 3.8, latitude: -23.550520, windSpeed: 2.3 },
      { month: "Julho", temperature: 17.5, solarRadiation: 3.9, latitude: -23.550520, windSpeed: 2.4 },
      { month: "Agosto", temperature: 19.0, solarRadiation: 4.5, latitude: -23.550520, windSpeed: 2.7 },
      { month: "Setembro", temperature: 20.5, solarRadiation: 4.8, latitude: -23.550520, windSpeed: 3.0 },
      { month: "Outubro", temperature: 22.0, solarRadiation: 5.1, latitude: -23.550520, windSpeed: 3.2 },
      { month: "Novembro", temperature: 23.0, solarRadiation: 5.4, latitude: -23.550520, windSpeed: 3.4 },
      { month: "Dezembro", temperature: 24.0, solarRadiation: 5.6, latitude: -23.550520, windSpeed: 3.6 },
    ],
  },
  {
    id: 2,
    name: "Campinas",
    monthlyData: [
      { month: "Janeiro", temperature: 23.8, solarRadiation: 5.3, latitude: -22.907104, windSpeed: 3.4 },
      { month: "Fevereiro", temperature: 24.2, solarRadiation: 5.6, latitude: -22.907104, windSpeed: 3.1 },
      { month: "Março", temperature: 23.5, solarRadiation: 5.1, latitude: -22.907104, windSpeed: 2.9 },
      { month: "Abril", temperature: 21.5, solarRadiation: 4.7, latitude: -22.907104, windSpeed: 2.7 },
      { month: "Maio", temperature: 19.0, solarRadiation: 4.1, latitude: -22.907104, windSpeed: 2.4 },
      { month: "Junho", temperature: 17.8, solarRadiation: 3.7, latitude: -22.907104, windSpeed: 2.2 },
      { month: "Julho", temperature: 17.2, solarRadiation: 3.8, latitude: -22.907104, windSpeed: 2.3 },
      { month: "Agosto", temperature: 18.5, solarRadiation: 4.4, latitude: -22.907104, windSpeed: 2.6 },
      { month: "Setembro", temperature: 20.0, solarRadiation: 4.7, latitude: -22.907104, windSpeed: 2.9 },
      { month: "Outubro", temperature: 21.8, solarRadiation: 5.0, latitude: -22.907104, windSpeed: 3.1 },
      { month: "Novembro", temperature: 22.5, solarRadiation: 5.3, latitude: -22.907104, windSpeed: 3.3 },
      { month: "Dezembro", temperature: 23.5, solarRadiation: 5.5, latitude: -22.907104, windSpeed: 3.5 },
    ],
  },
];

const calculateAverage = (data: number[]) => {
  return (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
};

export default function Cities() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCity, setExpandedCity] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cidades</h1>
          <p className="text-muted-foreground">Gerencie as cidades e seus dados climáticos mensais</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Cidade
        </Button>
      </div>

      <div className="space-y-2">
        {mockCities.map((city) => {
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
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
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
                        <div className="font-semibold">{avgWindSpeed} m/s</div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mês</TableHead>
                          <TableHead>Temperatura (°C)</TableHead>
                          <TableHead>Radiação Solar (kWh/m²)</TableHead>
                          <TableHead>Latitude</TableHead>
                          <TableHead>Velocidade Vento (m/s)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {city.monthlyData.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{data.month}</TableCell>
                            <TableCell>{data.temperature}°C</TableCell>
                            <TableCell>{data.solarRadiation}</TableCell>
                            <TableCell>{data.latitude}</TableCell>
                            <TableCell>{data.windSpeed}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      <CityFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
