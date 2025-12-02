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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

interface CityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function CityFormModal({ open, onOpenChange }: CityFormModalProps) {
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [temperature, setTemperature] = useState("");
  const [solarRadiation, setSolarRadiation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = () => {
    console.log({
      name,
      month,
      temperature: parseFloat(temperature),
      solarRadiation: parseFloat(solarRadiation),
      latitude: parseFloat(latitude),
      windSpeed: parseFloat(windSpeed),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Cidade - Dados Mensais</DialogTitle>
          <DialogDescription>
            Cadastre os dados climáticos mensais da cidade
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
                  {name || "Nome da Cidade"}
                </span>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Cidade *</Label>
                <Input
                  id="name"
                  placeholder="Ex: São Paulo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="month">Mês *</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="month">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura (°C) *</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 22.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solar-radiation">Radiação Solar Horizontal (kWh/m²) *</Label>
                  <Input
                    id="solar-radiation"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5.2"
                    value={solarRadiation}
                    onChange={(e) => setSolarRadiation(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    placeholder="Ex: -23.550520"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wind-speed">Velocidade do Vento (m/s) *</Label>
                  <Input
                    id="wind-speed"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 3.5"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(e.target.value)}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Cadastrar Dados</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
