import { Badge } from "@/components/ui/badge";

type Status = 
  | "pending" 
  | "scheduled" 
  | "approved" 
  | "cancelled" 
  | "completed"
  | "active"
  | "inactive";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  pending: { label: "Pendente", className: "bg-warning/20 text-warning border-warning/30" },
  scheduled: { label: "Agendado", className: "bg-info/20 text-info border-info/30" },
  approved: { label: "Aprovado", className: "bg-success/20 text-success border-success/30" },
  cancelled: { label: "Cancelado", className: "bg-destructive/20 text-destructive border-destructive/30" },
  completed: { label: "Concluído", className: "bg-success/20 text-success border-success/30" },
  active: { label: "Ativo", className: "bg-success/20 text-success border-success/30" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground border-muted-foreground/30" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
