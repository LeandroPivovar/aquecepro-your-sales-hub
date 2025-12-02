import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AppointmentFormModal } from "@/components/modals/AppointmentFormModal";

const mockAppointments = [
  { id: 1, date: "2024-01-15", time: "10:00", client: "Maria Silva", store: "Loja Centro", seller: "João Santos", address: "Rua A, 100", status: "scheduled" },
  { id: 2, date: "2024-01-15", time: "14:00", client: "Carlos Souza", store: "Loja Norte", seller: "Ana Costa", address: "Rua B, 200", status: "scheduled" },
  { id: 3, date: "2024-01-16", time: "09:00", client: "Pedro Lima", store: "Loja Sul", seller: "João Santos", address: "Rua C, 300", status: "pending" },
  { id: 4, date: "2024-01-16", time: "15:00", client: "Juliana Rocha", store: "Loja Centro", seller: "Paula Dias", address: "Rua D, 400", status: "scheduled" },
  { id: 5, date: "2024-01-17", time: "11:00", client: "Roberto Costa", store: "Loja Norte", seller: "Roberto Silva", address: "Rua E, 500", status: "pending" },
];

export default function Appointments() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<typeof mockAppointments[0] | null>(null);

  const handleEdit = (appointment: typeof mockAppointments[0]) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos de visitas</p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{appointment.client}</CardTitle>
                <StatusBadge status={appointment.status as any} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{appointment.date}</span>
                <span className="text-muted-foreground">às {appointment.time}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Loja: <span className="font-medium text-foreground">{appointment.store}</span></p>
                <p className="text-muted-foreground">Vendedor: <span className="font-medium text-foreground">{appointment.seller}</span></p>
                <p className="text-muted-foreground">Endereço: <span className="font-medium text-foreground">{appointment.address}</span></p>
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
                <Button variant="outline" size="sm" className="flex-1">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AppointmentFormModal 
        open={isModalOpen} 
        onOpenChange={handleCloseModal}
        appointment={selectedAppointment}
      />
    </div>
  );
}
