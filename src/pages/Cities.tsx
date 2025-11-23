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
import { Plus, Edit, Trash2, Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CityFormModal } from "@/components/modals/CityFormModal";

const mockCities = [
  { id: 1, name: "São Paulo", state: "SP", avgTemp: "22°C", heatIndex: "Alto", stores: 3 },
  { id: 2, name: "Campinas", state: "SP", avgTemp: "24°C", heatIndex: "Alto", stores: 2 },
  { id: 3, name: "Santos", state: "SP", avgTemp: "26°C", heatIndex: "Muito Alto", stores: 1 },
  { id: 4, name: "Sorocaba", state: "SP", avgTemp: "23°C", heatIndex: "Alto", stores: 1 },
];

const heatIndexColors: Record<string, string> = {
  "Baixo": "bg-info/20 text-info border-info/30",
  "Médio": "bg-warning/20 text-warning border-warning/30",
  "Alto": "bg-primary/20 text-primary border-primary/30",
  "Muito Alto": "bg-destructive/20 text-destructive border-destructive/30",
};

export default function Cities() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cidades</h1>
          <p className="text-muted-foreground">Gerencie as cidades atendidas</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Cidade
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Temperatura Média</TableHead>
              <TableHead>Índice de Calor</TableHead>
              <TableHead>Lojas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCities.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">{city.name}</TableCell>
                <TableCell>{city.state}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-primary" />
                    {city.avgTemp}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={heatIndexColors[city.heatIndex]}>
                    {city.heatIndex}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{city.stores}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CityFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
