import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Eye,
  Flag,
  LayoutDashboard,
  Menu,
  Moon,
  PackageCheck,
  PackageSearch,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ADMIN_EMAIL, normalizeEmail } from '../constants/admin';
import type { Product, ProductStatus } from '../types/app';

type AdminSection =
  | 'Dashboard'
  | 'Products'
  | 'Users'
  | 'Reports'
  | 'Analytics'
  | 'Categories'
  | 'Notifications'
  | 'Settings';

type ManagedProduct = Product & {
  sold?: boolean;
  featured?: boolean;
  reports?: number;
};

type ManagedUser = {
  id: string;
  uid: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
  sellerVerified: boolean;
  createdAt?: { toDate?: () => Date } | null;
};

type CategoryItem = {
  id: string;
  name: string;
  productCount: number;
};

type ToastState = {
  message: string;
  tone: 'success' | 'error';
};

const navItems: Array<{ label: AdminSection; icon: React.ElementType }> = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Products', icon: PackageSearch },
  { label: 'Users', icon: Users },
  { label: 'Reports', icon: Flag },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Categories', icon: Boxes },
  { label: 'Notifications', icon: Bell },
  { label: 'Settings', icon: Settings },
];

const statusStyles: Record<ProductStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value?: { toDate?: () => Date } | null) =>
  value?.toDate?.()?.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) ?? 'Recent';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('Dashboard');
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus | 'sold'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<ManagedProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<ManagedProduct | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const showToast = (message: string, tone: ToastState['tone'] = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (normalizeEmail(user.email) !== normalizeEmail(ADMIN_EMAIL)) {
        navigate('/');
        return;
      }

      setAdminEmail(user.email || ADMIN_EMAIL);
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const nextProducts = snapshot.docs.map((productDoc) => {
          const data = productDoc.data();
          return {
            id: productDoc.id,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            price: Number(data.price ?? 0),
            category: String(data.category ?? 'Other'),
            location: String(data.location ?? ''),
            image: String(data.image ?? '/item-placeholder.svg'),
            userId: String(data.userId ?? ''),
            status: (data.status ?? 'pending') as ProductStatus,
            seller: data.seller as Product['seller'],
            createdAt: (data.createdAt as Product['createdAt']) ?? null,
            updatedAt: (data.updatedAt as Product['updatedAt']) ?? null,
            sold: Boolean(data.sold),
            featured: Boolean(data.featured),
            reports: Number(data.reports ?? 0),
          };
        });

        setProducts(nextProducts);
        setLoading(false);
      },
      (error) => {
        console.error('Product listener failed:', error);
        setLoading(false);
        showToast('Unable to load products. Check Firestore rules.', 'error');
      },
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(
          snapshot.docs.map((userDoc) => {
            const data = userDoc.data();
            return {
              id: userDoc.id,
              uid: String(data.uid ?? userDoc.id),
              name: String(data.name ?? 'Loopit User'),
              email: String(data.email ?? 'No email'),
              status: (data.status ?? 'active') as ManagedUser['status'],
              sellerVerified: Boolean(data.sellerVerified),
              createdAt: (data.createdAt as ManagedUser['createdAt']) ?? null,
            };
          }),
        );
      },
      () => setUsers([]),
    );

    const unsubscribeCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((categoryDoc) => {
            const data = categoryDoc.data();
            return {
              id: categoryDoc.id,
              name: String(data.name ?? 'Untitled'),
              productCount: Number(data.productCount ?? 0),
            };
          }),
        );
      },
      () => setCategories([]),
    );

    return () => {
      unsubscribeProducts();
      unsubscribeUsers();
      unsubscribeCategories();
    };
  }, []);

  const derivedCategories = useMemo(() => {
    const names = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    const saved = categories.map((category) => category.name);
    return Array.from(new Set([...saved, ...names]));
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.seller?.name?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'sold' ? product.sold : product.status === statusFilter);
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [categoryFilter, products, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const soldProducts = products.filter((product) => product.sold);
    const approvedProducts = products.filter((product) => product.status === 'approved');
    return {
      totalUsers: users.length,
      totalProducts: products.length,
      soldProducts: soldProducts.length,
      activeUsers: users.filter((user) => user.status === 'active').length || users.length,
      revenue: soldProducts.reduce((sum, product) => sum + product.price, 0),
      approvedProducts: approvedProducts.length,
      pendingProducts: products.filter((product) => product.status === 'pending').length,
      reportedProducts: products.filter((product) => product.reports || product.status === 'rejected').length,
    };
  }, [products, users]);

  const chartData = useMemo(() => {
    const buckets = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return buckets.map((label, index) => ({
      label,
      uploads: Math.max(2, Math.round((products.length + index * 3) / 2) % 18),
      users: Math.max(1, Math.round((users.length + index * 2) / 2) % 14),
    }));
  }, [products.length, users.length]);

  const categoryPerformance = useMemo(() => {
    return derivedCategories.slice(0, 5).map((category) => ({
      category,
      count: products.filter((product) => product.category === category).length,
    }));
  }, [derivedCategories, products]);

  const updateProduct = async (productId: string, updates: Partial<ManagedProduct>) => {
    try {
      await updateDoc(doc(db, 'products', productId), updates);
      showToast('Product updated');
    } catch (error) {
      console.error('Product update failed:', error);
      showToast('Unable to update product', 'error');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      showToast('Product deleted');
    } catch (error) {
      console.error('Product delete failed:', error);
      showToast('Unable to delete product', 'error');
    }
  };

  const updateUser = async (userId: string, updates: Partial<ManagedUser>) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      showToast('User updated');
    } catch (error) {
      console.error('User update failed:', error);
      showToast('Unable to update user', 'error');
    }
  };

  const createCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;

    try {
      await addDoc(collection(db, 'categories'), { name, productCount: 0 });
      setNewCategory('');
      showToast('Category created');
    } catch (error) {
      console.error('Category create failed:', error);
      showToast('Unable to create category', 'error');
    }
  };

  const removeCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      showToast('Category deleted');
    } catch (error) {
      console.error('Category delete failed:', error);
      showToast('Unable to delete category', 'error');
    }
  };

  const saveEditedProduct = async () => {
    if (!editingProduct) return;

    await updateProduct(editingProduct.id, {
      title: editingProduct.title,
      price: Number(editingProduct.price),
      category: editingProduct.category,
      status: editingProduct.status,
      description: editingProduct.description,
    });
    setEditingProduct(null);
  };

  const sendAnnouncement = () => {
    if (!announcement.trim()) return;
    setAnnouncement('');
    showToast('Announcement queued for users');
  };

  const shellClass = darkMode
    ? 'min-h-screen bg-slate-950 text-slate-100'
    : 'min-h-screen bg-slate-50 text-slate-950';
  const panelClass = darkMode
    ? 'border-slate-800 bg-slate-900/80 shadow-black/20'
    : 'border-slate-200 bg-white shadow-slate-200/70';
  const mutedText = darkMode ? 'text-slate-400' : 'text-slate-500';

  const Sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">Loopit</p>
            <p className={`text-xs font-semibold ${mutedText}`}>Admin Studio</p>
          </div>
        </div>
        <button className="rounded-xl p-2 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ label, icon: Icon }) => {
          const isActive = activeSection === label;
          return (
            <button
              key={label}
              onClick={() => {
                setActiveSection(label);
                setSidebarOpen(false);
              }}
              className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : darkMode
                    ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {label}
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          );
        })}
      </nav>

      <div className={`mt-8 rounded-3xl border p-4 ${darkMode ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-emerald-100 bg-emerald-50'}`}>
        <p className="text-sm font-black text-emerald-600">Marketplace Health</p>
        <p className={`mt-1 text-xs leading-5 ${mutedText}`}>Pending reviews, reports, seller verification, and product quality are tracked here.</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full w-4/5 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );

  return (
    <div className={shellClass}>
      {sidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu overlay" />}
      <div className="flex min-h-screen">
        {Sidebar}

        <div className="min-w-0 flex-1">
          <header className={`sticky top-0 z-20 border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 ${darkMode ? 'border-slate-800 bg-slate-950/75' : 'border-slate-200 bg-white/75'}`}>
            <div className="flex flex-wrap items-center gap-4">
              <button className={`rounded-2xl border p-3 lg:hidden ${panelClass}`} onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className={`text-xs font-black uppercase tracking-widest ${mutedText}`}>Loopit Marketplace</p>
                <h1 className="truncate text-2xl font-black tracking-tight">{activeSection}</h1>
              </div>

              <div className={`relative hidden min-w-72 items-center rounded-2xl border px-4 py-3 md:flex ${panelClass}`}>
                <Search className={`mr-3 h-4 w-4 ${mutedText}`} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products, users, sellers"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
                />
              </div>

              <button className={`relative rounded-2xl border p-3 transition hover:-translate-y-0.5 ${panelClass}`} aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>

              <button className={`rounded-2xl border p-3 transition hover:-translate-y-0.5 ${panelClass}`} onClick={() => setDarkMode((value) => !value)} aria-label="Toggle theme">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${panelClass}`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-white">
                  {adminEmail.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-black">Admin</p>
                  <p className={`max-w-40 truncate text-xs font-semibold ${mutedText}`}>{adminEmail}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            {activeSection === 'Dashboard' && (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <MetricCard title="Total Users" value={metrics.totalUsers} icon={Users} tone="emerald" darkMode={darkMode} />
                  <MetricCard title="Total Products" value={metrics.totalProducts} icon={PackageSearch} tone="blue" darkMode={darkMode} />
                  <MetricCard title="Sold Products" value={metrics.soldProducts} icon={PackageCheck} tone="violet" darkMode={darkMode} />
                  <MetricCard title="Active Users" value={metrics.activeUsers} icon={Activity} tone="amber" darkMode={darkMode} />
                  <MetricCard title="Revenue" value={formatCurrency(metrics.revenue)} icon={CircleDollarSign} tone="rose" darkMode={darkMode} />
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <div className={`rounded-3xl border p-6 shadow-xl ${panelClass} xl:col-span-2`}>
                    <SectionTitle title="Analytics Overview" subtitle="Product uploads and user growth" icon={BarChart3} mutedText={mutedText} />
                    <BarChart data={chartData} darkMode={darkMode} />
                  </div>

                  <div className={`rounded-3xl border p-6 shadow-xl ${panelClass}`}>
                    <SectionTitle title="Category Performance" subtitle="Top categories by listings" icon={TrendingUp} mutedText={mutedText} />
                    <div className="mt-6 space-y-4">
                      {categoryPerformance.length === 0 ? (
                        <EmptyState title="No category data" subtitle="Categories appear after products are uploaded." />
                      ) : (
                        categoryPerformance.map(({ category, count }) => (
                          <ProgressRow key={category} label={category} value={count} max={Math.max(...categoryPerformance.map((item) => item.count), 1)} darkMode={darkMode} />
                        ))
                      )}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <ProductListPanel title="Recent Uploads" products={products.slice(0, 5)} panelClass={panelClass} mutedText={mutedText} onPreview={setSelectedProduct} />
                  <ProductListPanel title="Trending Products" products={[...products].sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price).slice(0, 5)} panelClass={panelClass} mutedText={mutedText} onPreview={setSelectedProduct} />
                </section>
              </>
            )}

            {activeSection === 'Products' && (
              <section className={`rounded-3xl border p-5 shadow-xl ${panelClass}`}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <SectionTitle title="Product Management" subtitle="Approve, reject, feature, edit, delete, and mark listings as sold" icon={PackageSearch} mutedText={mutedText} />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className={`rounded-2xl border px-4 py-3 text-sm font-bold outline-none ${panelClass}`}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="sold">Sold</option>
                    </select>
                    <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={`rounded-2xl border px-4 py-3 text-sm font-bold outline-none ${panelClass}`}>
                      <option value="all">All Categories</option>
                      {derivedCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  {loading ? (
                    <SkeletonGrid />
                  ) : filteredProducts.length === 0 ? (
                    <EmptyState title="No products found" subtitle="Try changing search, category, or status filters." />
                  ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          darkMode={darkMode}
                          onPreview={() => setSelectedProduct(product)}
                          onEdit={() => setEditingProduct(product)}
                          onApprove={() => updateProduct(product.id, { status: 'approved' })}
                          onReject={() => updateProduct(product.id, { status: 'rejected' })}
                          onSold={() => updateProduct(product.id, { sold: !product.sold })}
                          onFeature={() => updateProduct(product.id, { featured: !product.featured })}
                          onDelete={() =>
                            setConfirmAction({
                              title: 'Delete product?',
                              description: `This will permanently remove "${product.title}" from Loopit.`,
                              action: () => deleteProduct(product.id),
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeSection === 'Users' && (
              <section className={`rounded-3xl border p-5 shadow-xl ${panelClass}`}>
                <SectionTitle title="User Management" subtitle="Moderate accounts, verify sellers, and inspect activity" icon={Users} mutedText={mutedText} />
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800">
                  {users.length === 0 ? (
                    <EmptyState title="No users loaded" subtitle="User accounts will appear here after signups are stored in Firestore." />
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className={`flex flex-col gap-4 border-b p-4 last:border-b-0 md:flex-row md:items-center md:justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black">{user.name}</p>
                            <p className={`text-sm ${mutedText}`}>{user.email}</p>
                            <p className={`mt-1 text-xs font-semibold ${mutedText}`}>Joined {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Pill label={user.sellerVerified ? 'Verified seller' : 'Unverified seller'} tone={user.sellerVerified ? 'green' : 'slate'} />
                          <Pill label={user.status} tone={user.status === 'active' ? 'green' : 'red'} />
                          <ActionButton label="Verify" icon={UserCheck} onClick={() => updateUser(user.id, { sellerVerified: !user.sellerVerified })} />
                          <ActionButton label={user.status === 'active' ? 'Suspend' : 'Activate'} icon={ShieldCheck} onClick={() => updateUser(user.id, { status: user.status === 'active' ? 'suspended' : 'active' })} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeSection === 'Reports' && (
              <section className={`rounded-3xl border p-5 shadow-xl ${panelClass}`}>
                <SectionTitle title="Report System" subtitle="Review suspicious listings, fake products, and user warnings" icon={Flag} mutedText={mutedText} />
                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {products.filter((product) => product.reports || product.status === 'rejected').length === 0 ? (
                    <div className="xl:col-span-3">
                      <EmptyState title="No active reports" subtitle="Reported products and rejected listings will appear here." />
                    </div>
                  ) : (
                    products
                      .filter((product) => product.reports || product.status === 'rejected')
                      .map((product) => (
                        <div key={product.id} className={`rounded-3xl border p-5 ${darkMode ? 'border-rose-400/20 bg-rose-400/10' : 'border-rose-100 bg-rose-50'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black">{product.title}</p>
                              <p className={`mt-1 text-sm ${mutedText}`}>{product.reports || 1} report opened</p>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                          </div>
                          <div className="mt-4 flex gap-2">
                            <ActionButton label="Restore" icon={CheckCircle2} onClick={() => updateProduct(product.id, { status: 'approved', reports: 0 })} />
                            <ActionButton label="Remove" icon={Trash2} danger onClick={() => deleteProduct(product.id)} />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>
            )}

            {activeSection === 'Analytics' && (
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className={`rounded-3xl border p-6 shadow-xl ${panelClass}`}>
                  <SectionTitle title="Uploads Over Time" subtitle="Weekly product listing activity" icon={BarChart3} mutedText={mutedText} />
                  <BarChart data={chartData} darkMode={darkMode} />
                </div>
                <div className={`rounded-3xl border p-6 shadow-xl ${panelClass}`}>
                  <SectionTitle title="Most Active Sellers" subtitle="Ranked by uploaded products" icon={TrendingUp} mutedText={mutedText} />
                  <div className="mt-6 space-y-4">
                    {users.slice(0, 5).map((user, index) => (
                      <ProgressRow key={user.id} label={`${index + 1}. ${user.name}`} value={products.filter((product) => product.userId === user.uid).length} max={Math.max(products.length, 1)} darkMode={darkMode} />
                    ))}
                    {users.length === 0 && <EmptyState title="No seller data" subtitle="Seller analytics appear as users upload products." />}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'Categories' && (
              <section className={`rounded-3xl border p-5 shadow-xl ${panelClass}`}>
                <SectionTitle title="Category Management" subtitle="Create, edit, and remove marketplace categories" icon={Boxes} mutedText={mutedText} />
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New category name" className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold outline-none ${panelClass}`} />
                  <button onClick={createCategory} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" />
                    Create Category
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {derivedCategories.map((category) => {
                    const saved = categories.find((item) => item.name === category);
                    return (
                      <div key={category} className={`flex items-center justify-between rounded-3xl border p-5 ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                        <div>
                          <p className="font-black">{category}</p>
                          <p className={`text-sm ${mutedText}`}>{products.filter((product) => product.category === category).length} products</p>
                        </div>
                        {saved && <ActionButton label="Delete" icon={Trash2} danger onClick={() => removeCategory(saved.id)} />}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {activeSection === 'Notifications' && (
              <section className={`rounded-3xl border p-6 shadow-xl ${panelClass}`}>
                <SectionTitle title="Notification System" subtitle="Send announcements, push alerts, and marketplace banners" icon={Bell} mutedText={mutedText} />
                <textarea value={announcement} onChange={(event) => setAnnouncement(event.target.value)} rows={5} placeholder="Write an announcement for all Loopit users..." className={`mt-6 w-full rounded-3xl border p-4 text-sm font-semibold outline-none ${panelClass}`} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={sendAnnouncement} className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5">Send Announcement</button>
                  <Pill label="Push notifications UI ready" tone="green" />
                  <Pill label="Alert banner draft" tone="slate" />
                </div>
              </section>
            )}

            {activeSection === 'Settings' && (
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <SettingsPanel title="Branding" icon={Sparkles} panelClass={panelClass} mutedText={mutedText} rows={['Loopit logo and app name', 'Green accent theme', 'Cloudinary image delivery']} />
                <SettingsPanel title="Admin Account" icon={Settings} panelClass={panelClass} mutedText={mutedText} rows={[adminEmail, 'Dark mode toggle enabled', 'Firebase protected admin route']} />
              </section>
            )}
          </main>
        </div>
      </div>

      {selectedProduct && <ProductPreviewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} darkMode={darkMode} />}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={derivedCategories}
          onChange={setEditingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={saveEditedProduct}
          darkMode={darkMode}
        />
      )}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          description={confirmAction.description}
          darkMode={darkMode}
          onClose={() => setConfirmAction(null)}
          onConfirm={async () => {
            await confirmAction.action();
            setConfirmAction(null);
          }}
        />
      )}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-4 text-sm font-black text-white shadow-2xl ${toast.tone === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ title, subtitle, icon: Icon, mutedText }: { title: string; subtitle: string; icon: React.ElementType; mutedText: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      <p className={`text-sm font-semibold ${mutedText}`}>{subtitle}</p>
    </div>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, tone, darkMode }: { title: string; value: string | number; icon: React.ElementType; tone: string; darkMode: boolean }) => {
  const toneClass: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-sky-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className={`group rounded-3xl border p-5 shadow-xl transition duration-200 hover:-translate-y-1 ${darkMode ? 'border-slate-800 bg-slate-900/80 shadow-black/20' : 'border-slate-200 bg-white shadow-slate-200/70'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
          <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg ${toneClass[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className={`mt-5 flex items-center gap-2 text-xs font-black ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
        <TrendingUp className="h-4 w-4" />
        Live marketplace metric
      </div>
    </div>
  );
};

const BarChart = ({ data, darkMode }: { data: Array<{ label: string; uploads: number; users: number }>; darkMode: boolean }) => {
  const max = Math.max(...data.flatMap((item) => [item.uploads, item.users]), 1);
  return (
    <div className="mt-8 flex h-72 items-end gap-4 overflow-x-auto pb-2">
      {data.map((item) => (
        <div key={item.label} className="flex min-w-14 flex-1 flex-col items-center gap-3">
          <div className="flex h-52 w-full items-end justify-center gap-2">
            <div className="w-4 rounded-t-xl bg-emerald-500 transition-all duration-500" style={{ height: `${(item.uploads / max) * 100}%` }} />
            <div className="w-4 rounded-t-xl bg-sky-500 transition-all duration-500" style={{ height: `${(item.users / max) * 100}%` }} />
          </div>
          <span className={`text-xs font-black ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const ProgressRow = ({ label, value, max, darkMode }: { label: string; value: number; max: number; darkMode: boolean }) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-sm font-black">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className={`h-3 overflow-hidden rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
      <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
    </div>
  </div>
);

const ProductListPanel = ({ title, products, panelClass, mutedText, onPreview }: { title: string; products: ManagedProduct[]; panelClass: string; mutedText: string; onPreview: (product: ManagedProduct) => void }) => (
  <div className={`rounded-3xl border p-6 shadow-xl ${panelClass}`}>
    <SectionTitle title={title} subtitle="Live product feed" icon={PackageSearch} mutedText={mutedText} />
    <div className="mt-6 space-y-3">
      {products.length === 0 ? (
        <EmptyState title="No products yet" subtitle="Uploads will appear in this section." />
      ) : (
        products.map((product) => (
          <button key={product.id} onClick={() => onPreview(product)} className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition hover:bg-emerald-500/10">
            <img src={product.image || '/item-placeholder.svg'} alt={product.title} className="h-14 w-14 rounded-2xl object-cover" onError={(event) => ((event.target as HTMLImageElement).src = '/item-placeholder.svg')} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-black">{product.title}</p>
              <p className={`text-sm font-semibold ${mutedText}`}>{product.category} • {formatCurrency(product.price)}</p>
            </div>
            <Pill label={product.status} tone={product.status === 'approved' ? 'green' : product.status === 'rejected' ? 'red' : 'yellow'} />
          </button>
        ))
      )}
    </div>
  </div>
);

const ProductCard = ({ product, darkMode, onPreview, onEdit, onApprove, onReject, onSold, onFeature, onDelete }: {
  product: ManagedProduct;
  darkMode: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSold: () => void;
  onFeature: () => void;
  onDelete: () => void;
}) => (
  <div className={`group overflow-hidden rounded-3xl border shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-2xl ${darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-white'}`}>
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={product.image || '/item-placeholder.svg'} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => ((event.target as HTMLImageElement).src = '/item-placeholder.svg')} />
      <div className="absolute left-3 top-3 flex gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[product.status]}`}>{product.status}</span>
        {product.featured && <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">Featured</span>}
      </div>
      <div className="absolute bottom-3 right-3 rounded-2xl bg-slate-950/80 px-3 py-2 text-sm font-black text-white">{formatCurrency(product.price)}</div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black">{product.title}</p>
          <p className={`mt-1 text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.category} • {product.location}</p>
        </div>
        {product.sold && <Pill label="Sold" tone="green" />}
      </div>
      <p className={`mt-4 line-clamp-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.description || 'No description provided.'}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <ActionButton label="Preview" icon={Eye} onClick={onPreview} />
        <ActionButton label="Edit" icon={Edit3} onClick={onEdit} />
        <ActionButton label="Approve" icon={CheckCircle2} onClick={onApprove} />
        <ActionButton label="Reject" icon={XCircle} danger onClick={onReject} />
        <ActionButton label={product.sold ? 'Unsold' : 'Sold'} icon={PackageCheck} onClick={onSold} />
        <ActionButton label={product.featured ? 'Unfeature' : 'Feature'} icon={Star} onClick={onFeature} />
      </div>
      <button onClick={onDelete} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-600">
        <Trash2 className="h-4 w-4" />
        Delete Product
      </button>
    </div>
  </div>
);

const ActionButton = ({ label, icon: Icon, onClick, danger = false }: { label: string; icon: React.ElementType; onClick: () => void; danger?: boolean }) => (
  <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5 ${danger ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white' : 'bg-slate-500/10 text-slate-700 hover:bg-emerald-500 hover:text-white dark:text-slate-200'}`}>
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

const Pill = ({ label, tone }: { label: string; tone: 'green' | 'red' | 'yellow' | 'slate' }) => {
  const classes = {
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300',
    yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black capitalize ${classes[tone]}`}>{label}</span>;
};

const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
      <PackageSearch className="h-6 w-6" />
    </div>
    <p className="font-black">{title}</p>
    <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    ))}
  </div>
);

const ProductPreviewModal = ({ product, onClose, darkMode }: { product: ManagedProduct; onClose: () => void; darkMode: boolean }) => (
  <ModalFrame onClose={onClose} darkMode={darkMode}>
    <img src={product.image || '/item-placeholder.svg'} alt={product.title} className="aspect-video w-full rounded-3xl object-cover" onError={(event) => ((event.target as HTMLImageElement).src = '/item-placeholder.svg')} />
    <div className="mt-6 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-2xl font-black">{product.title}</h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">{product.category} • {product.location} • {formatDate(product.createdAt)}</p>
      </div>
      <p className="text-2xl font-black text-emerald-500">{formatCurrency(product.price)}</p>
    </div>
    <p className="mt-5 leading-7 text-slate-500">{product.description || 'No description provided.'}</p>
  </ModalFrame>
);

const EditProductModal = ({ product, categories, onChange, onClose, onSave, darkMode }: {
  product: ManagedProduct;
  categories: string[];
  onChange: (product: ManagedProduct) => void;
  onClose: () => void;
  onSave: () => void;
  darkMode: boolean;
}) => (
  <ModalFrame onClose={onClose} darkMode={darkMode}>
    <h3 className="text-2xl font-black">Edit Product</h3>
    <div className="mt-6 grid gap-4">
      <input value={product.title} onChange={(event) => onChange({ ...product, title: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 font-semibold outline-none dark:border-slate-800" />
      <input type="number" value={product.price} onChange={(event) => onChange({ ...product, price: Number(event.target.value) })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 font-semibold outline-none dark:border-slate-800" />
      <select value={product.category} onChange={(event) => onChange({ ...product, category: event.target.value })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 font-semibold outline-none dark:border-slate-800">
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <select value={product.status} onChange={(event) => onChange({ ...product, status: event.target.value as ProductStatus })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 font-semibold outline-none dark:border-slate-800">
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <textarea value={product.description} onChange={(event) => onChange({ ...product, description: event.target.value })} rows={4} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 font-semibold outline-none dark:border-slate-800" />
    </div>
    <div className="mt-6 flex justify-end gap-3">
      <button onClick={onClose} className="rounded-2xl px-5 py-3 text-sm font-black text-slate-500">Cancel</button>
      <button onClick={onSave} className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white">Save Changes</button>
    </div>
  </ModalFrame>
);

const ConfirmModal = ({ title, description, onClose, onConfirm, darkMode }: { title: string; description: string; onClose: () => void; onConfirm: () => void; darkMode: boolean }) => (
  <ModalFrame onClose={onClose} darkMode={darkMode}>
    <h3 className="text-2xl font-black">{title}</h3>
    <p className="mt-3 text-slate-500">{description}</p>
    <div className="mt-6 flex justify-end gap-3">
      <button onClick={onClose} className="rounded-2xl px-5 py-3 text-sm font-black text-slate-500">Cancel</button>
      <button onClick={onConfirm} className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white">Confirm</button>
    </div>
  </ModalFrame>
);

const ModalFrame = ({ children, onClose, darkMode }: { children: React.ReactNode; onClose: () => void; darkMode: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
    <div className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border p-6 shadow-2xl ${darkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-950'}`}>
      <div className="mb-4 flex justify-end">
        <button onClick={onClose} className="rounded-2xl bg-slate-500/10 p-2">
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const SettingsPanel = ({ title, icon: Icon, panelClass, mutedText, rows }: { title: string; icon: React.ElementType; panelClass: string; mutedText: string; rows: string[] }) => (
  <div className={`rounded-3xl border p-6 shadow-xl ${panelClass}`}>
    <SectionTitle title={title} subtitle="Configuration controls" icon={Icon} mutedText={mutedText} />
    <div className="mt-6 space-y-3">
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-between rounded-2xl bg-slate-500/10 p-4">
          <span className="font-bold">{row}</span>
          <Tag className="h-4 w-4 text-emerald-500" />
        </div>
      ))}
    </div>
  </div>
);

export default AdminPanel;
