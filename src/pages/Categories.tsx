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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, Category, CreateCategoryRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"categoria 1" | "categoria 2">("categoria 1");
  const [segment, setSegment] = useState<string>("Residencial");
  const [parentId, setParentId] = useState<string>("none");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => api.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Sucesso!',
        description: 'Categoria criada com sucesso',
      });
      resetForm();
      setIsModalOpen(false);
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
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryRequest> }) =>
      api.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Sucesso!',
        description: 'Categoria atualizada com sucesso',
      });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Sucesso!',
        description: 'Categoria removida com sucesso',
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

  const resetForm = () => {
    setName("");
    setType("categoria 1");
    setSegment("Residencial");
    setParentId("none");
    setDescription("");
    setEditingCategory(null);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setType(category.type || "categoria 1");
      setSegment(category.segment);
      setParentId(category.parentId || "none");
      setDescription(category.description || "");
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: 'Erro na validação',
        description: 'O nome da categoria é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (type === "categoria 2" && parentId === "none") {
      toast({
        title: 'Erro na validação',
        description: 'É necessário selecionar uma Categoria 1 pai.',
        variant: 'destructive',
      });
      return;
    }

    const categoryData: CreateCategoryRequest = {
      name: name.trim(),
      type: type,
      segment: segment,
      parentId: type === "categoria 2" ? (parentId !== "none" ? parentId : undefined) : undefined,
      description: description.trim() || undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: categoryData });
    } else {
      createMutation.mutate(categoryData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta categoria?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
            <p className="text-muted-foreground">Organize os produtos em categorias</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando categorias...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
            <p className="text-muted-foreground">Organize os produtos em categorias</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar categorias</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}>
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
          <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Organize os produtos em categorias</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Segmentação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma categoria cadastrada. Clique em "Nova Categoria" para começar.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {category.type}
                    </Badge>
                    {category.parentName && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        ↳ {category.parentName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-info/20 text-info border-info/30">
                      {category.segment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={category.status as any} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.productsCount || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
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

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Atualize as informações da categoria'
                : 'Cadastre uma nova categoria de produtos'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome da Categoria *</Label>
              <Input
                id="cat-name"
                placeholder="Ex: Aquecedores Solares"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-segment">Segmento *</Label>
                <Select
                  value={segment}
                  onValueChange={(value) => {
                    setSegment(value);
                    setParentId("none"); // reset parent when segment changes
                  }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <SelectTrigger id="cat-segment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Piscina">Piscina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-type">Nível da Categoria *</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as "categoria 1" | "categoria 2")}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <SelectTrigger id="cat-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="categoria 1">Categoria 1</SelectItem>
                    <SelectItem value="categoria 2">Categoria 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {type === "categoria 2" && (
              <div className="space-y-2">
                <Label htmlFor="cat-parent">Categoria 1 (Pai) *</Label>
                <Select
                  value={parentId}
                  onValueChange={(value) => setParentId(value)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <SelectTrigger id="cat-parent">
                    <SelectValue placeholder="Selecione a Categoria 1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>Selecione...</SelectItem>
                    {categories
                      .filter((c) => c.type === "categoria 1" && c.segment === segment)
                      .map((parentCat) => (
                        <SelectItem key={parentCat.id} value={parentCat.id}>
                          {parentCat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cat-description">Descrição</Label>
              <Textarea
                id="cat-description"
                placeholder="Descrição da categoria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingCategory ? 'Salvando...' : 'Criando...'}
                </>
              ) : (
                editingCategory ? 'Salvar Alterações' : 'Criar Categoria'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
