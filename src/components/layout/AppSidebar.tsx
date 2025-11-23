import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  Store,
  Package,
  FolderTree,
  Calendar,
  Plug,
  UserCircle,
  Flame,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Propostas", url: "/propostas", icon: FileText },
  { title: "Agendamentos", url: "/agendamentos", icon: Calendar },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Cidades", url: "/cidades", icon: MapPin },
  { title: "Lojas", url: "/lojas", icon: Store },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Categorias", url: "/categorias", icon: FolderTree },
  { title: "Integrações", url: "/integracoes", icon: Plug },
  { title: "Minha Conta", url: "/conta", icon: UserCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Flame className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">AquecePRO</h1>
              <p className="text-xs text-sidebar-foreground/70">Gestão Completa</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
