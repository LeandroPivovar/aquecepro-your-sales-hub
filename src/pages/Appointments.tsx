import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AppointmentFormModal } from "@/components/modals/AppointmentFormModal";
import { api, Appointment } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Appointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.getAppointments(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Sucesso!',
        description: 'Agendamento removido com sucesso',
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

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  };

  const handleCancel = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      api.updateAppointment(id, { status: 'cancelled' })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          toast({
            title: 'Sucesso!',
            description: 'Agendamento cancelado',
          });
        })
        .catch((error: Error) => {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive',
          });
        });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie os agendamentos de visitas.</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando agendamentos...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie os agendamentos de visitas.</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar agendamentos</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['appointments'] })}>
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
          <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos de visitas.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {appointments.length === 0 ? (
          <div className="col-span-full rounded-lg border bg-card p-8 text-center text-muted-foreground">
            Nenhum agendamento cadastrado. Clique em "Novo Agendamento" para começar.
          </div>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{appointment.clientName}</CardTitle>
                  <StatusBadge status={appointment.status as any} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatDate(appointment.date)}</span>
                  <span className="text-muted-foreground">às {appointment.time}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Loja: <span className="font-medium text-foreground">{appointment.storeName || '-'}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Vendedor: <span className="font-medium text-foreground">{appointment.sellerName || '-'}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Endereço: <span className="font-medium text-foreground">{appointment.address}</span>
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(appointment)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AppointmentFormModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        appointment={selectedAppointment}
      />
    </div>
  );
}
