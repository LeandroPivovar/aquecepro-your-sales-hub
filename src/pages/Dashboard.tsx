import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, TrendingUp, Calendar, Trophy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do desempenho da empresa</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando estatísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do desempenho da empresa</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar estatísticas</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Taxa de Conversão",
      value: `${stats.conversionRate.current}%`,
      description: "Últimos 30 dias",
      icon: TrendingUp,
      trend: { value: stats.conversionRate.change, isPositive: stats.conversionRate.isPositive },
    },
    {
      title: "Propostas Emitidas",
      value: stats.proposalsIssued.current.toString(),
      description: "Este mês",
      icon: FileText,
      trend: { value: stats.proposalsIssued.change, isPositive: stats.proposalsIssued.isPositive },
    },
    {
      title: "Propostas Fechadas",
      value: stats.proposalsClosed.current.toString(),
      description: "Este mês",
      icon: CheckCircle,
      trend: { value: stats.proposalsClosed.change, isPositive: stats.proposalsClosed.isPositive },
    },
    {
      title: "Propostas Canceladas",
      value: stats.proposalsCancelled.current.toString(),
      description: "Este mês",
      icon: XCircle,
      trend: { value: stats.proposalsCancelled.change, isPositive: stats.proposalsCancelled.isPositive },
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do desempenho da empresa</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
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
              <Badge variant="secondary">{stats.upcomingAppointments.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum agendamento próximo
                </p>
              ) : (
                stats.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between border-l-4 border-primary bg-muted/50 p-4 rounded-r-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{appointment.clientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.storeName}</p>
                      <p className="text-xs text-muted-foreground">
                        Vendedor: {appointment.sellerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time}</p>
                      <p className="text-xs text-muted-foreground">{appointment.date}</p>
                    </div>
                  </div>
                ))
              )}
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
              {stats.sellerRanking.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum vendedor encontrado
                </p>
              ) : (
                stats.sellerRanking.map((seller, index) => (
                  <div
                    key={seller.sellerId}
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
                        <p className="font-medium">{seller.sellerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {seller.appointments} agendamentos • {seller.proposals} propostas geradas • {seller.closed} fechamentos
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                      {seller.conversionRate}%
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
