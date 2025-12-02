import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import aquecepro_logo from "@/assets/aquecepro-logo.png";
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  Store,
  Package,
  FolderTree,
  Calendar,
  UserCircle,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const menuItems = [
  { title: "Visão Geral", url: "/", icon: LayoutDashboard },
  { title: "Propostas", url: "/propostas", icon: FileText },
  { title: "Agendamentos", url: "/agendamentos", icon: Calendar },
  { title: "Usuários", url: "/usuarios", icon: Users },
  { title: "Cidades", url: "/cidades", icon: MapPin },
  { title: "Lojas", url: "/lojas", icon: Store },
  { 
    title: "Produtos", 
    icon: Package,
    subItems: [
      { title: "Cadastrados", url: "/produtos" },
      { title: "Categorias", url: "/categorias" },
    ]
  },
  { title: "Minha Conta", url: "/conta", icon: UserCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="flex items-center justify-center px-4 py-6">
          <img 
            src={aquecepro_logo} 
            alt="AquecePRO" 
            className={isCollapsed ? "h-8 w-8 object-contain" : "h-12 w-auto object-contain"}
          />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if ('subItems' in item) {
                  const isAnySubItemActive = item.subItems?.some(sub => location.pathname === sub.url);
                  return (
                    <Collapsible key={item.title} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent">
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!isCollapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems?.map((subItem) => {
                                const isActive = location.pathname === subItem.url;
                                return (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                      <NavLink
                                        to={subItem.url}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent"
                                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                                      >
                                        <span>{subItem.title}</span>
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                
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
