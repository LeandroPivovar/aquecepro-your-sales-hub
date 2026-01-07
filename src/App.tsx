import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Proposals from "./pages/Proposals";
import Users from "./pages/Users";
import Cities from "./pages/Cities";
import Stores from "./pages/Stores";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Appointments from "./pages/Appointments";
import Integrations from "./pages/Integrations";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/propostas" element={<Proposals />} />
                      <Route path="/agendamentos" element={<Appointments />} />
                      <Route path="/usuarios" element={<Users />} />
                      <Route path="/cidades" element={<Cities />} />
                      <Route path="/lojas" element={<Stores />} />
                      <Route path="/produtos" element={<Products />} />
                      <Route path="/categorias" element={<Categories />} />
                      <Route path="/integracoes" element={<Integrations />} />
                      <Route path="/conta" element={<Account />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
