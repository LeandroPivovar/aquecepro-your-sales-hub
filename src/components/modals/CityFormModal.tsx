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
import { Textarea } from "@/components/ui/textarea";

interface CityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function CityFormModal({ open, onOpenChange }: CityFormModalProps) {
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [temperature, setTemperature] = useState("");
  const [heatIntensity, setHeatIntensity] = useState("");
  const [observations, setObservations] = useState("");

  const handleSubmit = () => {
    console.log({
      name,
      state,
      temperature: parseFloat(temperature),
      heatIntensity: parseFloat(heatIntensity),
      observations,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Cidade</DialogTitle>
          <DialogDescription>
            Cadastre uma nova cidade no sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
            <Label htmlFor="state">Estado *</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {brazilianStates.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura Média (°C) *</Label>
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
              <Label htmlFor="heat-intensity">Intensidade de Calor (0-10) *</Label>
              <Input
                id="heat-intensity"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Ex: 7.5"
                value={heatIntensity}
                onChange={(e) => setHeatIntensity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações Técnicas</Label>
            <Textarea
              id="observations"
              placeholder="Informações relevantes sobre o clima da região..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Cadastrar Cidade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
