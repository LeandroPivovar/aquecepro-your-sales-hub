import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Store as StoreIcon, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StoreFormModal } from "@/components/modals/StoreFormModal";
import { api, Store } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Stores() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading, error } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({
        title: 'Sucesso!',
        description: 'Loja removida com sucesso',
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

  const handleOpenModal = (store?: Store) => {
    if (store) {
      setEditingStore(store);
    } else {
      setEditingStore(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
    queryClient.invalidateQueries({ queryKey: ['stores'] });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta loja?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatAddress = (store: Store) => {
    const parts = [store.street, store.number];
    if (store.complement) parts.push(store.complement);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lojas</h1>
            <p className="text-muted-foreground">Gerencie as lojas da rede</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando lojas...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Lojas</h1>
            <p className="text-muted-foreground">Gerencie as lojas da rede</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar lojas</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['stores'] })}>
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
          <h1 className="text-3xl font-bold text-foreground">Lojas</h1>
          <p className="text-muted-foreground">Gerencie as lojas da rede</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Nova Loja
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Gerente</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma loja cadastrada. Clique em "Nova Loja" para começar.
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <StoreIcon className="h-4 w-4 text-primary" />
                      </div>
                      {store.name}
                    </div>
                  </TableCell>
                  <TableCell>{store.city}</TableCell>
                  <TableCell>{formatAddress(store)}</TableCell>
                  <TableCell>{store.phone}</TableCell>
                  <TableCell>{store.managerName || '-'}</TableCell>
                  <TableCell>{store.productsCount || 0}</TableCell>
                  <TableCell>
                    <StatusBadge status={store.status as any} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(store)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(store.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StoreFormModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        store={editingStore}
      />
    </div>
  );
}
