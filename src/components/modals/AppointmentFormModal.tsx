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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Appointment {
  id: number;
  date: string;
  time: string;
  client: string;
  store: string;
  seller: string;
  address: string;
  status: string;
}

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
}

const mockStores = ["Loja Centro", "Loja Norte", "Loja Sul"];
const mockSellers = ["João Santos", "Ana Costa", "Paula Dias", "Roberto Silva"];
const mockLeads = ["Maria Silva", "Carlos Souza", "Pedro Lima", "Juliana Rocha"];

export function AppointmentFormModal({ open, onOpenChange, appointment }: AppointmentFormModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [store, setStore] = useState("");
  const [sellerMode, setSellerMode] = useState("manual");
  const [seller, setSeller] = useState("");
  const [lead, setLead] = useState("");
  const [address, setAddress] = useState("");
  const [duration, setDuration] = useState("60");
  const [status, setStatus] = useState("scheduled");
  const [channel, setChannel] = useState("google");

  const isEditMode = !!appointment;

  // Preencher formulário quando em modo de edição
  useEffect(() => {
    if (appointment) {
      setDate(appointment.date);
      setTime(appointment.time);
      setStore(appointment.store);
      setSeller(appointment.seller);
      setLead(appointment.client);
      setAddress(appointment.address);
      setStatus(appointment.status);
    } else {
      // Resetar formulário quando não estiver editando
      setDate("");
      setTime("");
      setStore("");
      setSeller("");
      setLead("");
      setAddress("");
      setDuration("60");
      setStatus("scheduled");
      setChannel("google");
      setSellerMode("manual");
    }
  }, [appointment]);

  const handleSubmit = () => {
    console.log({
      id: appointment?.id,
      date,
      time,
      store,
      seller: sellerMode === "auto" ? "Rodízio automático" : seller,
      lead,
      address,
      duration,
      status,
      channel,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Atualize as informações do agendamento" 
              : "Agende uma visita técnica ou reunião com o cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store">Loja *</Label>
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger id="store">
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {mockStores.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Atribuição de Vendedor</Label>
            <RadioGroup value={sellerMode} onValueChange={setSellerMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="font-normal cursor-pointer">
                  Atribuir manualmente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="font-normal cursor-pointer">
                  Rodízio automático
                </Label>
              </div>
            </RadioGroup>

            {sellerMode === "manual" && (
              <Select value={seller} onValueChange={setSeller}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {mockSellers.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead">Cliente / Lead *</Label>
            <Select value={lead} onValueChange={setLead}>
              <SelectTrigger id="lead">
                <SelectValue placeholder="Selecione o lead" />
              </SelectTrigger>
              <SelectContent>
                {mockLeads.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço do Atendimento *</Label>
            <Textarea
              id="address"
              placeholder="Rua, número, complemento, bairro, cidade..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Canal do Agendamento</Label>
            <RadioGroup value={channel} onValueChange={setChannel}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="google" id="google" />
                <Label htmlFor="google" className="font-normal cursor-pointer">
                  Google Agenda
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="presencial" id="presencial" />
                <Label htmlFor="presencial" className="font-normal cursor-pointer">
                  Presencial
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? "Salvar Alterações" : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
