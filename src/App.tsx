import { useState, useEffect } from 'react';
import { User, signInAnonymously } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { initAuth, googleSignIn, db, auth, logout } from './lib/firebase';
import { addEventToGoogleCalendar, deleteEventFromGoogleCalendar } from './lib/calendar';
import { CommunityEvent } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import {
  Calendar,
  Grid,
  BarChart3,
  Sparkles,
  Bell,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  X,
  Users,
  ShieldCheck,
  Lock,
  Sun,
  Moon
} from 'lucide-react';

const ALLOWED_EMAILS = [
  'ederlcs@hotmail.com',
  'elaine.rsn@hotmail.com',
  'denisegomes738@gmail.com',
  'caroline.shirley@hotmail.com',
  'sofiadeoliveirarangel90@gmail.com',
  'gibeca26@gmail.com',
  'enycake@hotmail.com'
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'events' | 'dashboard'>('events');

  // Form modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);

  // Toast / Banner state
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Apply dark mode class to root document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Initialize Auth State Listener on Mount
  useEffect(() => {
    const unsubscribe = initAuth(
      async (currentUser, accessToken) => {
        if (currentUser) {
          const userEmail = currentUser.email?.toLowerCase();
          const isAllowed = currentUser.isAnonymous || (userEmail && ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(userEmail));
          
          if (isAllowed) {
            setUser(currentUser);
            setToken(accessToken);
            setNeedsAuth(false);
          } else {
            await logout();
            setUser(null);
            setToken(null);
            setNeedsAuth(true);
            setErrorToast(`Acesso recusado: O e-mail ${userEmail || ''} não está cadastrado para acesso.`);
          }
        } else {
          setUser(null);
          setToken(null);
          setNeedsAuth(true);
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch / Sync Events in real-time once user is logged in
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoadingEvents(false);
      return;
    }

    setLoadingEvents(true);
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData: CommunityEvent[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          eventsData.push({
            id: doc.id,
            title: data.title,
            theme: data.theme,
            description: data.description || '',
            date: data.date,
            revenue: Number(data.revenue || 0),
            expense: Number(data.expense || 0),
            attendees: Number(data.attendees || 0),
            creatorUid: data.creatorUid,
            creatorEmail: data.creatorEmail || '',
            calendarEventId: data.calendarEventId || undefined,
          } as CommunityEvent);
        });
        setEvents(eventsData);
        setLoadingEvents(false);
      },
      (err) => {
        console.error('Error fetching events:', err);
        setErrorToast('Não foi possível sincronizar os eventos do banco de dados.');
        setLoadingEvents(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Autohide notifications
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Handle Google Login Button Click
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorToast(null);
    try {
      const result = await googleSignIn();
      if (result) {
        const userEmail = result.user.email?.toLowerCase();
        const isAllowed = userEmail && ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(userEmail);
        
        if (isAllowed) {
          setUser(result.user);
          setToken(result.accessToken);
          setNeedsAuth(false);
          setSuccessToast('Acesso realizado com sucesso pelo Google!');
        } else {
          await logout();
          setErrorToast(`O e-mail ${userEmail || ''} não tem permissão de acesso a este painel.`);
        }
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setErrorToast('Falha na autenticação do Google. Certifique-se de aceitar as permissões necessárias.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Demo/Guest Bypass Login
  const handleDemoLogin = async () => {
    setIsLoggingIn(true);
    setErrorToast(null);
    try {
      const result = await signInAnonymously(auth);
      if (result) {
        setUser(result.user);
        setToken('');
        setNeedsAuth(false);
        setSuccessToast('Acesso em Modo de Demonstração realizado com sucesso!');
      }
    } catch (err: any) {
      console.error('Demo login failed:', err);
      setErrorToast('Falha ao entrar no Modo de Demonstração: ' + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Create or Update Event handler
  const handleSaveEvent = async (
    eventData: Omit<CommunityEvent, 'id' | 'creatorUid' | 'creatorEmail'>,
    syncToCalendar: boolean
  ) => {
    if (!user) throw new Error('Usuário não autenticado.');

    let calendarId: string | undefined = undefined;

    // 1. Sync with Google Calendar if toggled
    if (syncToCalendar && token && !editingEvent) {
      try {
        const calId = await addEventToGoogleCalendar({
          title: eventData.title,
          theme: eventData.theme,
          description: eventData.description,
          date: eventData.date,
        }, token);
        if (calId) {
          calendarId = calId;
        }
      } catch (calError) {
        console.error('Failed to sync to Google Calendar:', calError);
        // Inform user, but do not block firestore record creation
        setErrorToast('Encontro salvo no painel, mas falhou ao agendar no Google Calendar.');
      }
    }

    // 2. Save in Firestore
    try {
      if (editingEvent) {
        // Edit Action
        const eventDocRef = doc(db, 'events', editingEvent.id);
        await updateDoc(eventDocRef, {
          title: eventData.title,
          theme: eventData.theme,
          description: eventData.description,
          date: eventData.date,
          revenue: Number(eventData.revenue),
          expense: Number(eventData.expense),
          attendees: Number(eventData.attendees),
        });
        setSuccessToast('Evento bimestral atualizado com sucesso!');
      } else {
        // Create Action
        await addDoc(collection(db, 'events'), {
          title: eventData.title,
          theme: eventData.theme,
          description: eventData.description,
          date: eventData.date,
          revenue: Number(eventData.revenue),
          expense: Number(eventData.expense),
          attendees: Number(eventData.attendees),
          creatorUid: user.uid,
          creatorEmail: user.email || 'comunidade@central.com',
          calendarEventId: calendarId || null,
        });
        setSuccessToast(
          calendarId
            ? 'Evento criado e agendado com sucesso no Google Calendar!'
            : 'Evento criado com sucesso no painel central!'
        );
      }
    } catch (dbError) {
      console.error('Error saving event to Firestore:', dbError);
      throw new Error('Falha ao salvar evento no banco de dados.');
    }
  };

  // Delete event handler
  const handleDeleteEvent = async (event: CommunityEvent) => {
    if (!user) return;

    // Delete from Google Calendar if synced and token is active
    if (event.calendarEventId && token) {
      try {
        await deleteEventFromGoogleCalendar(event.calendarEventId, token);
      } catch (calError) {
        console.error('Failed to delete from Google Calendar:', calError);
      }
    }

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'events', event.id));
      setSuccessToast('Evento comunitário removido do painel.');
    } catch (dbError) {
      console.error('Error deleting event from Firestore:', dbError);
      setErrorToast('Falha ao remover evento no banco de dados.');
    }
  };

  // Seed sample events to the database under user's context
  const handleSeedSampleEvents = async () => {
    if (!user) return;
    try {
      const sampleEvents = [
        {
          title: 'Festival de Inverno da Central - Caldos & Fogueira',
          theme: 'Festival de Inverno' as const,
          description: 'O tradicional e charmoso Festival de Inverno da comunidade Central. Contará com buffet de caldos quentes, vinhos finos, fogueira decorativa e música acústica ao vivo.',
          date: '2026-07-25', // Happening very soon!
          revenue: 12500.00,
          expense: 8200.00,
          attendees: 240,
          creatorUid: user.uid,
          creatorEmail: user.email || 'ederlcs@hotmail.com',
        },
        {
          title: 'Cine Central - Cinema ao Ar Livre',
          theme: 'Cine Central' as const,
          description: 'Sessão especial de cinema no gramado central com pipoca artesanal ilimitada, debates culturais, telão inflável gigante e som imersivo de alta qualidade.',
          date: '2026-09-12',
          revenue: 3400.00,
          expense: 1800.00,
          attendees: 150,
          creatorUid: user.uid,
          creatorEmail: user.email || 'ederlcs@hotmail.com',
        },
        {
          title: 'Grande Almoço Tropical de Primavera',
          theme: 'Almoço Tropical' as const,
          description: 'Celebração festiva para reunir todas as famílias da comunidade. Delicioso churrasco, buffet de frutas da estação, sucos naturais exóticos e brinquedos infláveis.',
          date: '2026-11-15',
          revenue: 15800.00,
          expense: 10500.00,
          attendees: 310,
          creatorUid: user.uid,
          creatorEmail: user.email || 'ederlcs@hotmail.com',
        }
      ];

      for (const ev of sampleEvents) {
        await addDoc(collection(db, 'events'), ev);
      }
      setSuccessToast('Eventos de demonstração carregados com sucesso!');
    } catch (err) {
      console.error('Error seeding sample events:', err);
      setErrorToast('Erro ao carregar os eventos de demonstração no banco de dados.');
    }
  };

  // Open creation modal
  const handleOpenNewEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  // Open edit modal
  const handleOpenEditEvent = (event: CommunityEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Calculate upcoming events for notification (within 14 days)
  const upcomingEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= 14;
  });

  // Login screen if not authenticated
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 transition-colors duration-200">
        <div className="w-full max-w-md mx-auto flex justify-end">
          {/* Simple Theme Toggle Button on Login Screen */}
          <button
            onClick={handleToggleDarkMode}
            className="p-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-800 transition-all duration-200 cursor-pointer shadow-xs flex items-center justify-center"
            title={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400 animate-pulse" /> : <Moon className="w-4.5 h-4.5 text-indigo-500" />}
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-8">
          {/* Logo Branding */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-xl mx-auto border dark:border-slate-700">
              <Calendar className="w-9 h-9 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                Conecta
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                Gestão transparente e inteligente.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-lg w-full space-y-6 transition-colors duration-200">
            <div className="space-y-1.5 text-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Boas-vindas ao Painel Central
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesse com sua Conta Google para sincronizar com sua agenda (Google Calendar) e gerenciar eventos.
              </p>
            </div>

            {/* Google GSI Auth Button */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all duration-200 shadow-xs cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Entrar com o Google</span>
                </>
              )}
            </button>


          </div>

          {/* Guidelines info */}
          <div className="text-center">
            <span className="text-[10px] text-gray-400 font-mono">
              SISTEMA SEGURO COM AUTENTICAÇÃO INTEGRADA
            </span>
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 font-mono py-4">
          Conecta © 2026. Todos os direitos reservados à comunidade.
        </footer>
      </div>
    );
  }

  // Main Screen
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div>
        {/* Navigation Header */}
        <Header user={user} onLogoutSuccess={() => setNeedsAuth(true)} darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} />

        {/* Toast Alerts System */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-2">
          {successToast && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{successToast}</span>
              </div>
              <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorToast && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>{errorToast}</span>
              </div>
              <button onClick={() => setErrorToast(null)} className="text-red-500 hover:text-red-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Core content wrapper */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Bimestrial Coming Soon Notifications */}
          {upcomingEvents.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/15 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-300">
                <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-bounce" />
                <h4 className="text-sm font-bold font-display">
                  Lembrete de Próximos Encontros da Comunidade
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-orange-100 dark:border-orange-950 flex flex-col justify-between text-xs shadow-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{ev.title}</span>
                      <span className="text-gray-500 dark:text-slate-400 block font-mono">Data: {ev.date.split('-').reverse().join('/')}</span>
                    </div>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider mt-1.5 inline-block">
                      Faltam poucos dias!
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Selector / Sub-Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'events' ? 'Gerenciamento de Encontros' : 'Visão Consolidada'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                {activeTab === 'events'
                  ? 'Organize datas, temas, orçamentos e alcance das atividades da comunidade.'
                  : 'Veja de forma clara os relatórios financeiros consolidados de todos os encontros.'}
              </p>
            </div>

            {/* Tabs Buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start sm:self-center border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Eventos & Agenda</span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard & Relatórios</span>
              </button>
            </div>
          </div>

          {/* Display active tab content */}
          {loadingEvents ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium font-mono">Sincronizando com o banco de dados...</span>
            </div>
          ) : activeTab === 'events' ? (
            <EventList
              events={events}
              onEdit={handleOpenEditEvent}
              onDelete={handleDeleteEvent}
              onAddNewClick={handleOpenNewEvent}
              onSeed={handleSeedSampleEvents}
            />
          ) : (
            <Dashboard events={events} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-gray-200 dark:border-slate-850 py-6 text-center text-xs text-gray-500 dark:text-slate-500 space-y-1">
        <p className="font-display font-medium text-slate-800 dark:text-slate-300">Conecta Central</p>
        <p className="font-mono text-[10px]">Coded with precision © 2026</p>
      </footer>

      {/* Editor Modal Popup */}
      {isFormOpen && (
        <EventForm
          eventToEdit={editingEvent}
          hasCalendarToken={!!token}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
}
