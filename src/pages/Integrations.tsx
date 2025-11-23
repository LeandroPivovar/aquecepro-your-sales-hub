import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Integrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
        <p className="text-muted-foreground">Configure as integrações por loja</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <MessageSquare className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle>WhatsApp Business</CardTitle>
                  <CardDescription>Conecte o WhatsApp da loja</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                <CheckCircle className="mr-1 h-3 w-3" />
                Conectado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed bg-muted/50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-lg bg-background">
                <div className="text-xs text-muted-foreground">QR Code</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code com o WhatsApp da loja
              </p>
            </div>
            <div className="space-y-2">
              <Label>Loja</Label>
              <Input placeholder="Selecione a loja" />
            </div>
            <Button className="w-full" variant="outline">
              Desconectar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <LinkIcon className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Kommo CRM</CardTitle>
                  <CardDescription>Integração com Kommo</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                <XCircle className="mr-1 h-3 w-3" />
                Desconectado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Loja</Label>
              <Input placeholder="Selecione a loja" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Digite a API Key do Kommo" />
            </div>
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input placeholder="Digite o Account ID" />
            </div>
            <Button className="w-full">
              Conectar Kommo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
