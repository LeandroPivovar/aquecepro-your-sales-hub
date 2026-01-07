import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { api, CreateAppointmentRequest, Appointment, Store, User } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  initialData?: Partial<Pick<Appointment, 'clientId' | 'address'>>;
}

export function AppointmentFormModal({ open, onOpenChange, appointment, initialData }: AppointmentFormModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [storeId, setStoreId] = useState("");
  const [sellerMode, setSellerMode] = useState<"manual" | "auto">("manual");
  const [sellerId, setSellerId] = useState("");
  const [clientId, setClientId] = useState("");
  const [address, setAddress] = useState("");
  const [duration, setDuration] = useState("60");
  const [status, setStatus] = useState<"scheduled" | "pending" | "completed" | "cancelled">("scheduled");
  const [channel, setChannel] = useState<"google" | "presencial">("presencial");
  const queryClient = useQueryClient();

  // Buscar lojas, vendedores e clientes/leads
  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });

  const { data: sellers = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    select: (users) => users.filter((u) => u.role === 'seller' && u.isActive),
  });

  const { data: clients = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    select: (users) => users.filter((u) => (u.type === 'lead' || u.type === 'cliente') && u.isActive),
  });

  useEffect(() => {
    if (appointment && open) {
      setDate(appointment.date.split('T')[0]);
      setTime(appointment.time);
      setStoreId(appointment.storeId);
      setSellerId(appointment.sellerId || "");
      setSellerMode(appointment.autoAssign ? "auto" : "manual");
      setClientId(appointment.clientId);
      setAddress(appointment.address);
      setDuration(appointment.duration.toString());
      setStatus(appointment.status);
      setChannel(appointment.channel);
    } else if (!appointment && open) {
      // Se tiver initialData, usar para pré-preencher
      if (initialData) {
        setClientId(initialData.clientId || "");
        setAddress(initialData.address || "");
      } else {
        setClientId("");
        setAddress("");
      }
      setDate("");
      setTime("");
      setStoreId("");
      setSellerId("");
      setSellerMode("manual");
      setDuration("60");
      setStatus("scheduled");
      setChannel("presencial");
    }
  }, [appointment, open, initialData]);

  const createMutation = useMutation({
    mutationFn: (data: CreateAppointmentRequest) => api.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Sucesso!',
        description: 'Agendamento criado com sucesso',
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
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAppointmentRequest> }) =>
      api.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Sucesso!',
        description: 'Agendamento atualizado com sucesso',
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

  const handleSubmit = () => {
    if (!date || !time || !storeId || !clientId || !address) {
      toast({
        title: 'Erro na validação',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (sellerMode === "manual" && !sellerId) {
      toast({
        title: 'Erro na validação',
        description: 'Selecione um vendedor ou escolha rodízio automático',
        variant: 'destructive',
      });
      return;
    }

    const appointmentData: CreateAppointmentRequest = {
      date,
      time,
      storeId,
      sellerId: sellerMode === "manual" ? sellerId : undefined,
      clientId,
      address: address.trim(),
      duration: parseInt(duration, 10),
      status,
      channel,
      autoAssign: sellerMode === "auto",
    };

    if (appointment) {
      updateMutation.mutate({ id: appointment.id, data: appointmentData });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            {appointment
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store">Loja *</Label>
            <Select value={storeId} onValueChange={setStoreId} disabled={isLoading}>
              <SelectTrigger id="store">
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Atribuição de Vendedor</Label>
            <RadioGroup value={sellerMode} onValueChange={(value) => setSellerMode(value as typeof sellerMode)} disabled={isLoading}>
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
              <Select value={sellerId} onValueChange={setSellerId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Cliente / Lead *</Label>
            <Select value={clientId} onValueChange={setClientId} disabled={isLoading}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecione o cliente ou lead" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
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
              disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)} disabled={isLoading}>
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
            <RadioGroup value={channel} onValueChange={(value) => setChannel(value as typeof channel)} disabled={isLoading}>
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
                {appointment ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              appointment ? "Salvar Alterações" : "Criar Agendamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
