import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, User, LoginRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há usuário salvo
    const storedUser = api.getStoredUser();
    if (storedUser && api.isAuthenticated()) {
      setUser(storedUser);
      // Validar token verificando o perfil
      api.getProfile()
        .then((profile) => {
          setUser(profile);
          api.setAuth(api.getToken()!, profile);
        })
        .catch(() => {
          // Token inválido, limpar
          api.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.login(credentials);
      api.setAuth(response.accessToken, response.user);
      setUser(response.user);
      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo, ${response.user.name}`,
      });
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      toast({
        title: 'Erro no login',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    navigate('/login');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso',
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (api.getToken()) {
      api.setAuth(api.getToken()!, updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

