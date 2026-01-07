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
import { Switch } from "@/components/ui/switch";
import { api, CreateUserRequest, User, Store } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserFormModal({ open, onOpenChange, user }: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "seller" | "user">("user");
  const [type, setType] = useState<"usuario" | "lead" | "cliente">("usuario");
  const [storeId, setStoreId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const queryClient = useQueryClient();

  // Buscar lojas
  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });

  useEffect(() => {
    if (user && open) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setPhone(user.phone || "");
      setRole(user.role);
      setType(user.type);
      setStoreId(user.storeId || "");
      setIsActive(user.isActive);
    } else if (!user && open) {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRole("user");
      setType("usuario");
      setStoreId("");
      setIsActive(true);
    }
  }, [user, open]);

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Sucesso!',
        description: 'Usuário criado com sucesso',
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
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserRequest> }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Sucesso!',
        description: 'Usuário atualizado com sucesso',
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

  const requiresStore = ["manager", "seller"].includes(role);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || (!user && !password.trim())) {
      toast({
        title: 'Erro na validação',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (requiresStore && !storeId) {
      toast({
        title: 'Erro na validação',
        description: 'Loja é obrigatória para este papel',
        variant: 'destructive',
      });
      return;
    }

    const userData: CreateUserRequest | Partial<CreateUserRequest> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      type,
      storeId: requiresStore ? storeId : undefined,
      isActive,
      ...(user ? {} : { password: password.trim() }),
    };

    if (user) {
      updateMutation.mutate({ id: user.id, data: userData });
    } else {
      createMutation.mutate(userData as CreateUserRequest);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {user ? 'Atualize as informações do usuário' : 'Cadastre um novo usuário no sistema'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              placeholder="Digite o nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={type} onValueChange={(value) => setType(value as typeof type)} disabled={isLoading}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usuario">Usuário</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Papel no Sistema *</Label>
            <Select value={role} onValueChange={(value) => setRole(value as typeof role)} disabled={isLoading}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="seller">Vendedor</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requiresStore && (
            <div className="space-y-2">
              <Label htmlFor="store">Loja Vinculada *</Label>
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
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="active">Status do Usuário</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? "Usuário ativo" : "Usuário inativo"}
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
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
                {user ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              user ? 'Salvar Alterações' : 'Criar Usuário'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
