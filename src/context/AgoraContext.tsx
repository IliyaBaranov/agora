import React,
  {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
  } from 'react';
import {
  User,
  Marketplace,
  MarketplaceUser,
  Job,
  FavoriteMarketplace,
  UserRole,
  ProducerStatus,
  ProducerApprovalStatus,
  JobStatus,
} from '@/types/agora';

interface AgoraContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;

  // Credits (пока фронтовые, без API)
  addCredits: (userId: string, amount: number) => void;
  deductCredits: (amount: number) => boolean;
  topUpCredits: (amount: number) => void;

  // Marketplaces
  marketplaces: Marketplace[];
  createMarketplace: (
    name: string,
    slug: string,
    city: string
  ) => Promise<Marketplace>;
  getMarketplace: (slug: string) => Marketplace | undefined;

  // Favorites
  favorites: FavoriteMarketplace[];
  addFavorite: (marketplaceId: string) => void;
  removeFavorite: (marketplaceId: string) => void;
  isFavorite: (marketplaceId: string) => boolean;

  // Bootstrap
  bootstrapFromMe: () => void;

  // Marketplace Users
  marketplaceUsers: MarketplaceUser[];
  getUsersInMarketplace: (
    marketplaceId: string
  ) => (MarketplaceUser & { user: User })[];
  getUserRoleInMarketplace: (marketplaceId: string) => UserRole | null;
  setUserRoleInMarketplace: (marketplaceId: string, role: UserRole) => void;
  getProducersByStatus: (
    marketplaceId: string,
    approvalStatus: ProducerApprovalStatus
  ) => (MarketplaceUser & { user: User })[];
  approveProducer: (userId: string, marketplaceId: string) => void;
  rejectProducer: (userId: string, marketplaceId: string) => void;
  registerAsProducer: (marketplaceId: string, description: string) => void;
  updateProducerStatus: (marketplaceId: string, status: ProducerStatus) => void;
  getCurrentProducerStatus: (marketplaceId: string) => ProducerStatus | null;
  getProducerEarnings: (marketplaceId: string) => number;

  // Jobs
  jobs: Job[];
  createJob: (
    marketplaceId: string,
    title: string,
    description: string,
    address: string,
    preferredTime: string,
    price: number,
    lat: number,
    lng: number
  ) => void;
  getJobsInMarketplace: (marketplaceId: string) => Job[];
  getAvailableJobs: (marketplaceId: string) => Job[];
  getCustomerJobs: (marketplaceId: string) => Job[];
  takeJob: (jobId: string) => void;
  completeJob: (jobId: string) => void;
  payForJob: (jobId: string) => Promise<boolean>;

  // All users (for admin)
  allUsers: User[];
  getUserById: (userId: string) => User | undefined;

  // Demo role switcher
  currentDemoRole: UserRole;
  setCurrentDemoRole: React.Dispatch<React.SetStateAction<UserRole>>;

  // Admin: set role
  setAdminRole: (marketplaceId: string, userId: string, role: UserRole) => void;
}

const API = import.meta.env.VITE_API_URL;

const AgoraContext = createContext<AgoraContextType | null>(null);

// --- helpers ---
const fixDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

export function AgoraProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [marketplaceUsers, setMarketplaceUsers] = useState<MarketplaceUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMarketplace[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentDemoRole, setCurrentDemoRole] = useState<UserRole>('CUSTOMER');

  const bootstrapFromMe = () => {
    fetch(`${API}/api/me.php`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.currentUser) {
          setCurrentUser(null);
          setMarketplaces([]);
          setMarketplaceUsers([]);
          setJobs([]);
          setFavorites([]);
          setAllUsers([]);
          return;
        }

        const {
          currentUser: u,
          marketplaces: mps,
          marketplaceUsers: mus,
          jobs: js,
          favorites: favs,
          allUsers: aus,
        } = data;

        const mappedUser: User = {
          id: String(u.id),
          name: u.name,
          email: u.email,
          credits: Number(u.credits ?? 0),
          createdAt: fixDate(u.createdAt ?? u.created_at),
        };
        setCurrentUser(mappedUser);

        const mappedAllUsers: User[] = (aus || []).map((x: any) => ({
          id: String(x.id),
          name: x.name,
          email: x.email,
          credits: Number(x.credits ?? 0),
          createdAt: fixDate(x.createdAt ?? x.created_at),
        }));
        setAllUsers(mappedAllUsers);

        const mappedMps: Marketplace[] = (mps || []).map((m: any) => ({
          id: String(m.id),
          name: m.name,
          slug: m.slug,
          city: m.city,
          createdAt: fixDate(m.createdAt ?? m.created_at),
          ownerId: String(m.ownerId ?? m.owner_id),
        }));
        setMarketplaces(mappedMps);

        const mappedMus: MarketplaceUser[] = (mus || []).map((mu: any) => ({
          userId: String(mu.user_id ?? mu.userId),
          marketplaceId: String(mu.marketplace_id ?? mu.marketplaceId),
          role: mu.role as UserRole,
          status: mu.status as ProducerStatus | undefined,
          approvalStatus: mu.approval_status as ProducerApprovalStatus | undefined,
          rating:
            mu.rating !== null && mu.rating !== undefined
              ? Number(mu.rating)
              : undefined,
          completedJobs:
            mu.completed_jobs !== null && mu.completed_jobs !== undefined
              ? Number(mu.completed_jobs)
              : undefined,
          jobsCreated:
            mu.jobs_created !== null && mu.jobs_created !== undefined
              ? Number(mu.jobs_created)
              : undefined,
          description: mu.description ?? undefined,
          earnings:
            mu.earnings !== null && mu.earnings !== undefined
              ? Number(mu.earnings)
              : undefined,
        }));
        setMarketplaceUsers(mappedMus);

        const mappedJobs: Job[] = (js || []).map((j: any) => ({
          id: String(j.id),
          marketplaceId: String(j.marketplace_id ?? j.marketplaceId),
          customerId: String(j.customer_id ?? j.customerId),
          producerId:
            j.producer_id !== null && j.producer_id !== undefined
              ? String(j.producer_id)
              : j.producerId
              ? String(j.producerId)
              : undefined,
          title: j.title,
          description: j.description,
          address: j.address,
          preferredTime: j.preferred_time ?? j.preferredTime,
          price: Number(j.price),
          isPaid: Boolean(j.is_paid ?? j.isPaid),
          status: (j.status as JobStatus) ?? 'OPEN',
          createdAt: fixDate(j.created_at ?? j.createdAt),
          lat:
            j.lat !== null && j.lat !== undefined
              ? Number(j.lat)
              : undefined,
          lng:
            j.lng !== null && j.lng !== undefined
              ? Number(j.lng)
              : undefined,
        }));
        setJobs(mappedJobs);

        const mappedFavs: FavoriteMarketplace[] = (favs || []).map(
          (f: any) => ({
            userId: String(f.user_id ?? f.userId),
            marketplaceId: String(f.marketplace_id ?? f.marketplaceId),
          })
        );
        setFavorites(mappedFavs);
      })
      .catch((err) => {
        console.error('Failed to load /api/me.php', err);
      });
  };

  useEffect(() => {
    bootstrapFromMe();
  }, []);

  // ---- Auth ----

  const login = (email: string, password: string) => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/auth_login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          console.error('Login failed');
          return;
        }
        bootstrapFromMe();
      } catch (e) {
        console.error('Login error', e);
      }
    })();
  };

  const register = (name: string, email: string, password: string) => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/auth_register.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          console.error('Register failed');
          return;
        }
        bootstrapFromMe();
      } catch (e) {
        console.error('Register error', e);
      }
    })();
  };

  const logout = () => {
    (async () => {
      try {
        await fetch(`${API}/api/logout.php`, {
          credentials: 'include',
        });
      } catch {
        // nothing
      }
      setCurrentUser(null);
      setMarketplaces([]);
      setMarketplaceUsers([]);
      setJobs([]);
      setFavorites([]);
      setAllUsers([]);
    })();
  };

  // ---- Credits (пока фронтовые) ----

  const addCredits = (userId: string, amount: number) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, credits: u.credits + amount } : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, credits: currentUser.credits + amount });
    }
  };

  const deductCredits = (amount: number): boolean => {
    if (!currentUser || currentUser.credits < amount) return false;
    const updated = { ...currentUser, credits: currentUser.credits - amount };
    setCurrentUser(updated);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updated : u))
    );
    return true;
  };

  const topUpCredits = (amount: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, credits: currentUser.credits + amount };
    setCurrentUser(updated);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updated : u))
    );
  };

  // ---- Marketplaces ----

  const createMarketplace = async (
    name: string,
    slug: string,
    city: string
  ): Promise<Marketplace> => {
    if (!currentUser) {
      throw new Error('Not logged in');
    }

    const res = await fetch(`${API}/api/marketplaces.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, slug, city }),
    });

    if (!res.ok) {
      console.error('Failed to create marketplace');
      throw new Error('Failed to create marketplace');
    }

    const data = await res.json();

    const marketplace: Marketplace = {
      id: String(data.id),
      name: data.name,
      slug: data.slug,
      city: data.city,
      createdAt: fixDate(data.createdAt ?? new Date()),
      ownerId: String(data.ownerId ?? currentUser.id),
    };

    setMarketplaces((prev) => [marketplace, ...prev]);

    setMarketplaceUsers((prev) => [
      ...prev,
      {
        userId: currentUser.id,
        marketplaceId: marketplace.id,
        role: 'ADMIN',
        status: 'ONLINE',
        approvalStatus: 'APPROVED',
        earnings: 0,
        completedJobs: 0,
        jobsCreated: 0,
      },
    ]);

    setFavorites((prev) => [
      ...prev,
      { userId: currentUser.id, marketplaceId: marketplace.id },
    ]);

    return marketplace;
  };

  const getMarketplace = (slug: string) =>
    marketplaces.find((m) => m.slug === slug);

  // ---- Favorites ----

  const addFavorite = (marketplaceId: string) => {
    if (!currentUser) return;

    setFavorites((prev) => {
      if (
        prev.some(
          (f) => f.userId === currentUser.id && f.marketplaceId === marketplaceId
        )
      ) {
        return prev;
      }

      (async () => {
        try {
          await fetch(`${API}/api/favorites.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              marketplaceId: Number(marketplaceId),
            }),
          });
        } catch (e) {
          console.error('addFavorite error', e);
        }
      })();

      return [...prev, { userId: currentUser.id, marketplaceId }];
    });
  };

  const removeFavorite = (marketplaceId: string) => {
    if (!currentUser) return;

    setFavorites((prev) =>
      prev.filter(
        (f) =>
          !(
            f.userId === currentUser.id && f.marketplaceId === marketplaceId
          )
      )
    );

    (async () => {
      try {
        await fetch(`${API}/api/favorites.php`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            marketplaceId: Number(marketplaceId),
          }),
        });
      } catch (e) {
        console.error('removeFavorite error', e);
      }
    })();
  };

  const isFavorite = (marketplaceId: string) => {
    if (!currentUser) return false;
    return favorites.some(
      (f) => f.userId === currentUser.id && f.marketplaceId === marketplaceId
    );
  };

  // ---- Users & roles ----

  const getUserById = (userId: string): User | undefined =>
    allUsers.find((u) => u.id === userId);

  const getUsersInMarketplace = (
    marketplaceId: string
  ): (MarketplaceUser & { user: User })[] => {
    return marketplaceUsers
      .filter((mu) => mu.marketplaceId === marketplaceId)
      .map((mu) => ({
        ...mu,
        user:
          allUsers.find((u) => u.id === mu.userId) || {
            id: mu.userId,
            name: 'Unknown',
            email: '',
            credits: 0,
            createdAt: new Date(),
          },
      }));
  };

  const getUserRoleInMarketplace = (marketplaceId: string): UserRole | null => {
    if (!currentUser) return null;
    const mu = marketplaceUsers.find(
      (m) => m.userId === currentUser.id && m.marketplaceId === marketplaceId
    );
    return mu?.role || null;
  };

  const setUserRoleInMarketplace = (marketplaceId: string, role: UserRole) => {
    if (!currentUser) return;
    setMarketplaceUsers((prev) => {
      const existing = prev.find(
        (m) => m.userId === currentUser.id && m.marketplaceId === marketplaceId
      );
      if (existing) {
        return prev.map((m) =>
          m.userId === currentUser.id && m.marketplaceId === marketplaceId
            ? { ...m, role }
            : m
        );
      }
      return [...prev, { userId: currentUser.id, marketplaceId, role }];
    });
  };

  const setAdminRole = async (
    marketplaceId: string,
    userId: string,
    role: UserRole
  ) => {
    try {
      const res = await fetch(`${API}/api/admin_set_role.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          marketplaceId: Number(marketplaceId),
          userId: Number(userId),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        console.error('Failed to set role:', data.error);
        return;
      }

      setMarketplaceUsers((prev) =>
        prev.map((mu) =>
          mu.userId === userId && mu.marketplaceId === marketplaceId
            ? { ...mu, role }
            : mu
        )
      );
    } catch (e) {
      console.error('setAdminRole error:', e);
    }
  };

  const getProducersByStatus = (
    marketplaceId: string,
    approvalStatus: ProducerApprovalStatus
  ) => {
    return marketplaceUsers
      .filter(
        (mu) =>
          mu.marketplaceId === marketplaceId &&
          mu.approvalStatus === approvalStatus
      )
      .map((mu) => ({
        ...mu,
        user:
          allUsers.find((u) => u.id === mu.userId) || {
            id: mu.userId,
            name: 'Unknown',
            email: '',
            credits: 0,
            createdAt: new Date(),
          },
      }));
  };

  const approveProducer = (userId: string, marketplaceId: string) => {
    (async () => {
      try {
        await fetch(`${API}/api/admin_set_role.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            marketplaceId: Number(marketplaceId),
            userId: Number(userId),
            status: 'APPROVED', // ✅ ВАЖНО
          }),
        });
      } catch (e) {
        console.error('approveProducer error', e);
      }
    })();
  
    setMarketplaceUsers((prev) =>
      prev.map((mu) =>
        mu.userId === userId && mu.marketplaceId === marketplaceId
          ? {
              ...mu,
              role: 'PRODUCER',
              approvalStatus: 'APPROVED',
              status: 'OFFLINE',
            }
          : mu
      )
    );
  };

  const rejectProducer = (userId: string, marketplaceId: string) => {
    (async () => {
      try {
        await fetch(`${API}/api/admin_set_role.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            marketplaceId: Number(marketplaceId),
            userId: Number(userId),
            status: 'REJECTED', // ✅ ВАЖНО
          }),
        });
      } catch (e) {
        console.error('rejectProducer error', e);
      }
    })();
  
    setMarketplaceUsers((prev) =>
      prev.map((mu) =>
        mu.userId === userId && mu.marketplaceId === marketplaceId
          ? {
              ...mu,
              role: 'CUSTOMER',
              approvalStatus: 'REJECTED',
              status: 'OFFLINE',
            }
          : mu
      )
    );
  };  

  const registerAsProducer = (marketplaceId: string, description: string) => {
    if (!currentUser) return;

    (async () => {
      try {
        const res = await fetch(`${API}/api/producers.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            marketplaceId: Number(marketplaceId),
            description,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          bootstrapFromMe();
        }
      } catch (e) {
        console.error('registerAsProducer error', e);
      }
    })();

    setMarketplaceUsers((prev) => {
      const existing = prev.find(
        (mu) => mu.userId === currentUser.id && mu.marketplaceId === marketplaceId
      );
      if (existing) {
        return prev.map((mu) =>
          mu.userId === currentUser.id && mu.marketplaceId === marketplaceId
            ? { ...mu, approvalStatus: 'PENDING', description }
            : mu
        );
      }
      return [
        ...prev,
        {
          userId: currentUser.id,
          marketplaceId,
          role: 'CUSTOMER',
          status: 'OFFLINE',
          approvalStatus: 'PENDING',
          description,
        },
      ];
    });
  };

  const updateProducerStatus = async (marketplaceId: string, newStatus: ProducerStatus) => {
    try {
      const res = await fetch(`${API}/api/producer_update_status.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplaceId, status: newStatus })
      });
  
      const data = await res.json();
      if (!data.success) return;
  
      setMarketplaceUsers(prev =>
        prev.map(mu =>
          mu.userId === currentUser?.id && mu.marketplaceId === marketplaceId
            ? { 
                ...mu, 
                status: newStatus as ProducerStatus  // ← вот это важно
              }
            : mu
        )
      );
    } catch (err) {
      console.error(err);
    }
  };  

  const getCurrentProducerStatus = (
    marketplaceId: string
  ): ProducerStatus | null => {
    if (!currentUser) return null;
    const mu = marketplaceUsers.find(
      (m) => m.userId === currentUser.id && m.marketplaceId === marketplaceId
    );
    return (mu?.status as ProducerStatus) || null;
  };

  const getProducerEarnings = (marketplaceId: string): number => {
    if (!currentUser) return 0;
    const mu = marketplaceUsers.find(
      (m) => m.userId === currentUser.id && m.marketplaceId === marketplaceId
    );
    return mu?.earnings || 0;
  };

  // ---- Jobs ----

  const createJob = (
    marketplaceId: string,
    title: string,
    description: string,
    address: string,
    preferredTime: string,
    price: number,
    lat: number,
    lng: number
  ) => {
    if (!currentUser) return;

    (async () => {
      try {
        const res = await fetch(`${API}/api/jobs.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            marketplaceId: Number(marketplaceId),
            title,
            description,
            address,
            preferredTime,
            price,
            lat,
            lng,
          }),
        });

        let id: string;

        if (res.ok) {
          const data = await res.json();
          id = String(data.id);
        } else {
          id = `j${Date.now()}`;
        }

        const newJob: Job = {
          id,
          marketplaceId,
          customerId: currentUser.id,
          title,
          description,
          address,
          preferredTime,
          price,
          lat,
          lng,
          isPaid: false,
          status: 'OPEN',
          createdAt: new Date(),
        };

        setJobs((prev) => [...prev, newJob]);
      } catch (e) {
        console.error('createJob error', e);
      }
    })();
  };

  const getJobsInMarketplace = (marketplaceId: string) =>
    jobs.filter((j) => j.marketplaceId === marketplaceId);

  const getAvailableJobs = (marketplaceId: string) =>
    jobs.filter(
      (j) => j.marketplaceId === marketplaceId && j.status === 'OPEN'
    );

  const getCustomerJobs = (marketplaceId: string) => {
    if (!currentUser) return [];
    return jobs.filter(
      (j) =>
        j.marketplaceId === marketplaceId && j.customerId === currentUser.id
    );
  };

  const takeJob = (jobId: string) => {
    if (!currentUser) return;

    (async () => {
      try {
        await fetch(`${API}/jobs_take.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ jobId: Number(jobId) }),
        });
      } catch (e) {
        console.error('takeJob error', e);
      }
    })();

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? ({
              ...j,
              status: 'TAKEN' as JobStatus,
              producerId: currentUser.id,
            } as Job)
          : j
      )
    );

    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      updateProducerStatus(job.marketplaceId, 'WORKING');
    }
  };

  const completeJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !job.producerId) {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? ({ ...j, status: 'COMPLETED' } as Job) : j
        )
      );
      return;
    }

    (async () => {
      try {
        await fetch(`${API}/api/jobs_complete.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ jobId: Number(jobId) }),
        });
      } catch (e) {
        console.error('completeJob error', e);
      }
    })();

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? ({ ...j, status: 'COMPLETED' } as Job) : j
      )
    );
  };

  const payForJob = async (jobId: string): Promise<boolean> => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.isPaid) return false;

    try {
      const res = await fetch(`${API}/api/jobs_pay.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jobId: Number(jobId) }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        console.error('payForJob error:', data.error);
        return false;
      }

      // списываем кредиты у клиента (фронтово)
      deductCredits(job.price);

      // добавляем кредиты продюсеру (фронтово)
      if (job.producerId) {
        addCredits(job.producerId, job.price);
      }

      // обновляем job локально
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                isPaid: true,
                status: 'COMPLETED',
              }
            : j
        )
      );

      // обновляем статистику продюсера
      if (job.producerId) {
        setMarketplaceUsers((prev) =>
          prev.map((mu) =>
            mu.userId === job.producerId &&
            mu.marketplaceId === job.marketplaceId
              ? {
                  ...mu,
                  earnings: (mu.earnings || 0) + job.price,
                  completedJobs: (mu.completedJobs || 0) + 1,
                }
              : mu
          )
        );
      }

      return true;
    } catch (e) {
      console.error('payForJob error:', e);
      return false;
    }
  };

  return (
    <AgoraContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        addCredits,
        deductCredits,
        topUpCredits,
        marketplaces,
        createMarketplace,
        getMarketplace,
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        marketplaceUsers,
        getUsersInMarketplace,
        getUserRoleInMarketplace,
        setAdminRole,
        setUserRoleInMarketplace,
        getProducersByStatus,
        approveProducer,
        rejectProducer,
        registerAsProducer,
        updateProducerStatus,
        getCurrentProducerStatus,
        getProducerEarnings,
        jobs,
        createJob,
        getJobsInMarketplace,
        getAvailableJobs,
        getCustomerJobs,
        takeJob,
        completeJob,
        payForJob,
        allUsers,
        getUserById,
        currentDemoRole,
        setCurrentDemoRole,
        bootstrapFromMe,
      }}
    >
      {children}
    </AgoraContext.Provider>
  );
}

export function useAgora() {
  const context = useContext(AgoraContext);
  if (!context) {
    throw new Error('useAgora must be used within an AgoraProvider');
  }
  return context;
}
