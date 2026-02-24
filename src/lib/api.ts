// Em produção, usa URL relativa (/api/) para o Nginx fazer proxy
// Em desenvolvimento, usa localhost:3020 ou a variável de ambiente
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3020/api');

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'seller' | 'user';
  type: 'usuario' | 'lead' | 'cliente';
  storeId?: string;
  storeName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  code: string;
  description: string;
  proposalDescription: string;
  segment: string;
  category1: string;
  category2: string;
  technicalSpecs?: Record<string, any>;
  cost: number;
  saleValue: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  code: string;
  description: string;
  proposalDescription: string;
  segment: string;
  category1: string;
  category2: string;
  technicalSpecs?: Record<string, any>;
  cost: number;
  saleValue: number;
  status?: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  type: 'categoria 1' | 'categoria 2';
  segment: string;
  parentId?: string;
  parentName?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  productsCount?: number;
}

export interface CreateCategoryRequest {
  name: string;
  type?: 'categoria 1' | 'categoria 2';
  segment: string;
  parentId?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface Store {
  id: string;
  name: string;
  city: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
  phone: string;
  email: string;
  openingHours: string;
  managerId?: string;
  managerName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  productsCount?: number;
}

export interface CreateStoreRequest {
  name: string;
  city: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
  phone: string;
  email: string;
  openingHours: string;
  managerId?: string;
  status?: 'active' | 'inactive';
}

export interface MonthlyData {
  id?: string;
  month: string;
  temperature: number;
  solarRadiation: number;
  windSpeed: number;
}

export interface City {
  id: string;
  name: string;
  latitude: number;
  monthlyData: MonthlyData[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityRequest {
  name: string;
  latitude: number;
  monthlyData?: {
    month: string;
    temperature: number;
    solarRadiation: number;
    windSpeed: number;
  }[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'manager' | 'seller' | 'user';
  type: 'usuario' | 'lead' | 'cliente';
  storeId?: string;
  isActive?: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  storeId: string;
  storeName?: string;
  sellerId?: string;
  sellerName?: string;
  clientId: string;
  clientName: string;
  address: string;
  duration: number;
  status: 'scheduled' | 'pending' | 'completed' | 'cancelled';
  channel: 'google' | 'presencial';
  autoAssign: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  date: string;
  time: string;
  storeId: string;
  sellerId?: string;
  clientId: string;
  address: string;
  duration?: number;
  status?: 'scheduled' | 'pending' | 'completed' | 'cancelled';
  channel?: 'google' | 'presencial';
  autoAssign?: boolean;
}

export interface Proposal {
  id: string;
  segment: 'piscina' | 'residencial';
  userId?: string;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  isNewClient: boolean;
  city?: string;
  data: Record<string, any>;
  status: string;
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalRequest {
  segment: 'piscina' | 'residencial';
  client?: {
    id?: string;
    name?: string;
    phone?: string;
    isNew?: boolean;
  };
  city?: string;
  data: Record<string, any>;
}

export interface UpdateProposalRequest {
  segment?: 'piscina' | 'residencial';
  client?: {
    id?: string;
    name?: string;
    phone?: string;
    isNew?: boolean;
  };
  city?: string;
  data?: Record<string, any>;
  status?: string;
}

export interface DashboardStats {
  conversionRate: {
    current: number;
    previous: number;
    change: number;
    isPositive: boolean;
  };
  proposalsIssued: {
    current: number;
    previous: number;
    change: number;
    isPositive: boolean;
  };
  proposalsClosed: {
    current: number;
    previous: number;
    change: number;
    isPositive: boolean;
  };
  proposalsCancelled: {
    current: number;
    previous: number;
    change: number;
    isPositive: boolean;
  };
  upcomingAppointments: {
    id: string;
    clientName: string;
    storeName: string;
    sellerName: string;
    date: string;
    time: string;
  }[];
  sellerRanking: {
    sellerId: string;
    sellerName: string;
    appointments: number;
    proposals: number;
    closed: number;
    conversionRate: number;
  }[];
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
      const errorMessage = error.message || error.data?.message || `Erro: ${response.status}`;
      throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<{ data: LoginResponse } | LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // O interceptor pode retornar { data: LoginResponse } ou apenas LoginResponse
    return 'data' in response ? response.data : response;
  }

  async register(credentials: RegisterRequest): Promise<LoginResponse> {
    const response = await this.request<{ data: LoginResponse } | LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // O interceptor pode retornar { data: LoginResponse } ou apenas LoginResponse
    return 'data' in response ? response.data : response;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<{ data: User } | User>('/auth/profile');
    // O interceptor pode retornar { data: User } ou apenas User
    return 'data' in response ? response.data : response;
  }

  async updateProfile(data: { name?: string; email?: string; phone?: string }): Promise<User> {
    const response = await this.request<{ data: User } | User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await this.request<{ data: { message: string } } | { message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const response = await this.request<{ data: Product[] } | Product[]>('/products');
    const products = 'data' in response ? response.data : response;
    return Array.isArray(products) ? products : [];
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.request<{ data: Product } | Product>(`/products/${id}`);
    return 'data' in response ? response.data : response;
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await this.request<{ data: Product } | Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    const response = await this.request<{ data: Product } | Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async importProducts(file: File): Promise<{ message: string, importedCount: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request<{ message: string, importedCount: number }>('/products/import', {
      method: 'POST',
      body: formData,
    });
    return response;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.request<{ data: Category[] } | Category[]>('/categories');
    const categories = 'data' in response ? response.data : response;
    return Array.isArray(categories) ? categories : [];
  }

  async getCategory(id: string): Promise<Category> {
    const response = await this.request<{ data: Category } | Category>(`/categories/${id}`);
    return 'data' in response ? response.data : response;
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await this.request<{ data: Category } | Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async updateCategory(id: string, data: Partial<CreateCategoryRequest>): Promise<Category> {
    const response = await this.request<{ data: Category } | Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Stores
  async getStores(): Promise<Store[]> {
    const response = await this.request<{ data: Store[] } | Store[]>('/stores');
    const stores = 'data' in response ? response.data : response;
    return Array.isArray(stores) ? stores : [];
  }

  async getStore(id: string): Promise<Store> {
    const response = await this.request<{ data: Store } | Store>(`/stores/${id}`);
    return 'data' in response ? response.data : response;
  }

  async createStore(data: CreateStoreRequest): Promise<Store> {
    const response = await this.request<{ data: Store } | Store>('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async updateStore(id: string, data: Partial<CreateStoreRequest>): Promise<Store> {
    const response = await this.request<{ data: Store } | Store>(`/stores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async deleteStore(id: string): Promise<void> {
    await this.request(`/stores/${id}`, {
      method: 'DELETE',
    });
  }

  // Cities
  async getCities(): Promise<City[]> {
    const response = await this.request<{ data: City[] } | City[]>('/cities');
    const cities = 'data' in response ? response.data : response;
    return Array.isArray(cities) ? cities : [];
  }

  async getCity(id: string): Promise<City> {
    const response = await this.request<{ data: City } | City>(`/cities/${id}`);
    return 'data' in response ? response.data : response;
  }

  async createCity(data: CreateCityRequest): Promise<City> {
    const response = await this.request<{ data: City } | City>('/cities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async updateCity(id: string, data: Partial<CreateCityRequest>): Promise<City> {
    const response = await this.request<{ data: City } | City>(`/cities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async deleteCity(id: string): Promise<void> {
    await this.request(`/cities/${id}`, {
      method: 'DELETE',
    });
  }

  async importCities(file: File): Promise<{ message: string, importedCount: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request<{ message: string, importedCount: number }>('/cities/import', {
      method: 'POST',
      body: formData,
    });
    return response;
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await this.request<{ data: User[] } | User[]>('/users');
    const users = 'data' in response ? response.data : response;
    return Array.isArray(users) ? users : [];
  }

  async getUser(id: string): Promise<User> {
    const response = await this.request<{ data: User } | User>(`/users/${id}`);
    return 'data' in response ? response.data : response;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.request<{ data: User } | User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async updateUser(id: string, data: Partial<CreateUserRequest>): Promise<User> {
    const response = await this.request<{ data: User } | User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const response = await this.request<{ data: Appointment[] } | Appointment[]>('/appointments');
    const appointments = 'data' in response ? response.data : response;
    return Array.isArray(appointments) ? appointments : [];
  }

  async getAppointment(id: string): Promise<Appointment> {
    const response = await this.request<{ data: Appointment } | Appointment>(`/appointments/${id}`);
    return 'data' in response ? response.data : response;
  }

  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await this.request<{ data: Appointment } | Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async updateAppointment(id: string, data: Partial<CreateAppointmentRequest>): Promise<Appointment> {
    const response = await this.request<{ data: Appointment } | Appointment>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'data' in response ? response.data : response;
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Proposals
  async getProposals(): Promise<Proposal[]> {
    const response = await this.request<{ data: Proposal[] } | Proposal[]>('/proposals');
    const proposals = 'data' in response ? response.data : response;
    return Array.isArray(proposals) ? proposals : [];
  }

  async getProposal(id: string): Promise<Proposal> {
    const response = await this.request<{ data: Proposal } | Proposal>(`/proposals/${id}`);
    return ('segment' in response) ? response : (response as { data: Proposal }).data;
  }

  async createProposal(data: CreateProposalRequest): Promise<Proposal> {
    const response = await this.request<{ data: Proposal } | Proposal>('/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return ('segment' in response) ? response : (response as { data: Proposal }).data;
  }

  async updateProposal(id: string, data: Partial<UpdateProposalRequest>): Promise<Proposal> {
    const response = await this.request<{ data: Proposal } | Proposal>(`/proposals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return ('segment' in response) ? response : (response as { data: Proposal }).data;
  }

  async deleteProposal(id: string): Promise<void> {
    await this.request(`/proposals/${id}`, {
      method: 'DELETE',
    });
  }

  async closeProposal(id: string): Promise<Proposal> {
    const response = await this.request<{ data: Proposal } | Proposal>(`/proposals/${id}/close`, {
      method: 'PATCH',
    });
    return ('segment' in response) ? response : (response as { data: Proposal }).data;
  }

  async cancelProposal(id: string): Promise<Proposal> {
    const response = await this.request<{ data: Proposal } | Proposal>(`/proposals/${id}/cancel`, {
      method: 'PATCH',
    });
    return ('segment' in response) ? response : (response as { data: Proposal }).data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.request<{ data: DashboardStats } | DashboardStats>('/dashboard/stats');
    return 'data' in response ? response.data : response;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setAuth(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const api = new ApiService();

