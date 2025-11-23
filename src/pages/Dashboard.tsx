import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, TrendingUp, Calendar, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Taxa de Conversão",
    value: "32%",
    description: "Últimos 30 dias",
    icon: TrendingUp,
    trend: { value: 5.2, isPositive: true },
  },
  {
    title: "Propostas Emitidas",
    value: "156",
    description: "Este mês",
    icon: FileText,
    trend: { value: 12.3, isPositive: true },
  },
  {
    title: "Propostas Fechadas",
    value: "50",
    description: "Este mês",
    icon: CheckCircle,
    trend: { value: 8.1, isPositive: true },
  },
  {
    title: "Propostas Canceladas",
    value: "18",
    description: "Este mês",
    icon: XCircle,
    trend: { value: 3.2, isPositive: false },
  },
];

const upcomingAppointments = [
  { id: 1, client: "Maria Silva", store: "Loja Centro", date: "2024-01-15", time: "10:00", seller: "João Santos" },
  { id: 2, client: "Carlos Souza", store: "Loja Norte", date: "2024-01-15", time: "14:00", seller: "Ana Costa" },
  { id: 3, client: "Pedro Lima", store: "Loja Sul", date: "2024-01-16", time: "09:00", seller: "João Santos" },
  { id: 4, client: "Juliana Rocha", store: "Loja Centro", date: "2024-01-16", time: "15:00", seller: "Paula Dias" },
];

const topSellers = [
  { name: "João Santos", proposals: 45, closed: 18, rate: "40%" },
  { name: "Ana Costa", proposals: 38, closed: 15, rate: "39%" },
  { name: "Paula Dias", proposals: 32, closed: 11, rate: "34%" },
  { name: "Roberto Silva", proposals: 28, closed: 8, rate: "29%" },
  { name: "Carla Mendes", proposals: 25, closed: 7, rate: "28%" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do desempenho da empresa</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximos Agendamentos
              </CardTitle>
              <Badge variant="secondary">{upcomingAppointments.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between border-l-4 border-primary bg-muted/50 p-4 rounded-r-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">{appointment.store}</p>
                    <p className="text-xs text-muted-foreground">
                      Vendedor: {appointment.seller}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <p className="text-xs text-muted-foreground">{appointment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Ranking de Vendedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellers.map((seller, index) => (
                <div
                  key={seller.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-warning text-warning-foreground' :
                      index === 1 ? 'bg-muted-foreground/20 text-foreground' :
                      index === 2 ? 'bg-primary/20 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{seller.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {seller.proposals} propostas • {seller.closed} fechadas
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                    {seller.rate}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
