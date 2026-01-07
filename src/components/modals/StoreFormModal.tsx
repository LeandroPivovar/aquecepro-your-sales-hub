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
import { api, CreateStoreRequest, Store, User } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StoreFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store?: Store | null;
}

export function StoreFormModal({ open, onOpenChange, store }: StoreFormModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [managerId, setManagerId] = useState("");

  const queryClient = useQueryClient();

  // Buscar usuários para seleção de gerente
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      // Por enquanto, retornar array vazio. Quando houver endpoint de usuários, usar aqui
      return [];
    },
    enabled: false, // Desabilitar por enquanto
  });

  // Carregar dados da loja quando estiver editando
  useEffect(() => {
    if (store && open) {
      setName(store.name);
      setCity(store.city);
      setStreet(store.street);
      setNumber(store.number);
      setComplement(store.complement || "");
      setNeighborhood(store.neighborhood);
      setZipCode(store.zipCode);
      setPhone(store.phone);
      setEmail(store.email);
      setOpeningHours(store.openingHours);
      setManagerId(store.managerId || "");
    } else if (!store && open) {
      // Resetar formulário para nova loja
      setName("");
      setCity("");
      setStreet("");
      setNumber("");
      setComplement("");
      setNeighborhood("");
      setZipCode("");
      setPhone("");
      setEmail("");
      setOpeningHours("");
      setManagerId("");
    }
  }, [store, open]);

  const createMutation = useMutation({
    mutationFn: (data: CreateStoreRequest) => api.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({
        title: 'Sucesso!',
        description: 'Loja criada com sucesso',
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
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStoreRequest> }) =>
      api.updateStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({
        title: 'Sucesso!',
        description: 'Loja atualizada com sucesso',
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
    if (!name || !city || !street || !number || !neighborhood || !zipCode || !phone || !email || !openingHours) {
      toast({
        title: 'Erro na validação',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const storeData: CreateStoreRequest = {
      name: name.trim(),
      city: city.trim(),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim() || undefined,
      neighborhood: neighborhood.trim(),
      zipCode: zipCode.trim(),
      phone: phone.trim(),
      email: email.trim(),
      openingHours: openingHours.trim(),
      managerId: managerId || undefined,
    };

    if (store) {
      updateMutation.mutate({ id: store.id, data: storeData });
    } else {
      createMutation.mutate(storeData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{store ? 'Editar Loja' : 'Nova Loja'}</DialogTitle>
          <DialogDescription>
            {store ? 'Atualize as informações da loja' : 'Cadastre uma nova loja no sistema'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Loja *</Label>
            <Input
              id="name"
              placeholder="Ex: Loja Centro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              placeholder="Ex: São Paulo - SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <Label>Endereço Completo</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Input
                  placeholder="Rua / Avenida *"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Número *"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                disabled={isLoading}
              />
              <Input
                placeholder="Bairro *"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Input
              placeholder="CEP *"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 3333-4444"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="loja@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Horário de Funcionamento *</Label>
            <Input
              id="hours"
              placeholder="Ex: Seg a Sex 8h-18h, Sáb 8h-12h"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">Gerente Responsável</Label>
            <Input
              id="manager"
              placeholder="ID do gerente (opcional)"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Por enquanto, insira o ID do usuário. Em breve, será possível selecionar da lista.
            </p>
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
                {store ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              store ? 'Salvar Alterações' : 'Cadastrar Loja'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
