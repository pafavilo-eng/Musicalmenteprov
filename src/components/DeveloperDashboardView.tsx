import React, { useState, useEffect } from 'react';
import { Language, UserProfile, PublicPresence } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { firebaseService, ADMIN_EMAIL, isAdminUser } from '../services/firebaseService';
import { AvatarDisplay } from './AvatarDisplay';
import { UserStatusBadge } from './UserStatusBadge';
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Flame, 
  Trophy, 
  Clock, 
  Search, 
  Filter, 
  Activity, 
  Gamepad2, 
  RefreshCw,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface DeveloperDashboardViewProps {
  currentUser: UserProfile;
  lang: Language;
  onBack: () => void;
}

export const DeveloperDashboardView: React.FC<DeveloperDashboardViewProps> = ({
  currentUser,
  lang,
  onBack,
}) => {
  const t = TRANSLATIONS[lang];
  const isAuthorized = isAdminUser(currentUser);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load registered users and presence in real-time if authorized
  useEffect(() => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to presence
    const unsubPresence = firebaseService.subscribeToPublicPresence((list) => {
      const map: Record<string, boolean> = {};
      list.forEach((p) => {
        map[p.userId] = p.isOnline;
      });
      setPresenceMap(map);
    });

    // Fetch registered users from Firestore
    firebaseService
      .getRegisteredUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching users for admin:', err);
        setLoading(false);
      });

    return () => {
      unsubPresence();
    };
  }, [isAuthorized, refreshKey]);

  // If user is NOT fabilhano@gmail.com, show strict restricted access screen
  if (!isAuthorized) {
    return (
      <div 
        className="w-full max-w-md mx-auto flex flex-col min-h-screen px-4 py-8 select-none"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 2rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 2rem)',
        }}
      >
        <div className="card-clay rounded-3xl p-6 text-center border-4 border-rose-300 bg-rose-50/50 shadow-xl my-auto">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 mx-auto mb-4 flex items-center justify-center border-2 border-rose-200">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold font-display text-rose-950 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-xs text-rose-800 leading-relaxed mb-6 font-sans">
            {t.accessRestricted}
          </p>
          <div className="p-3 bg-white/80 rounded-2xl border border-rose-200 text-left mb-6 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Seu usuário atual:</p>
            <p className="truncate text-slate-600">Nome: <span className="font-medium text-slate-800">{currentUser.name}</span></p>
            <p className="truncate text-slate-600">E-mail: <span className="font-medium text-slate-800">{currentUser.email || 'Não informado (Convidado)'}</span></p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              onBack();
            }}
            className="w-full py-3.5 px-4 rounded-2xl text-white font-display font-bold text-sm btn-3d-amber flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <ArrowLeft size={18} />
            <span>Voltar ao MusicalMente</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate live summary stats
  const totalUsersCount = users.length;
  const onlineCount = users.filter((u) => {
    // Current user is always online
    if (u.id === currentUser.id) return true;
    return presenceMap[u.id] !== undefined ? presenceMap[u.id] : (u.isOnline ?? false);
  }).length;
  const offlineCount = Math.max(0, totalUsersCount - onlineCount);
  const totalMatchesCount = users.reduce((acc, u) => acc + (u.totalMatches || 0), 0);

  // Latest activity time
  const mostRecentUser = [...users].sort((a, b) => {
    const timeA = new Date(a.lastActivity || a.createdAt || 0).getTime();
    const timeB = new Date(b.lastActivity || b.createdAt || 0).getTime();
    return timeB - timeA;
  })[0];

  const lastActivityDisplay = mostRecentUser?.lastActivity
    ? new Date(mostRecentUser.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Agora';

  // Filter and search users
  const filteredUsers = users.filter((u) => {
    const isUserOnline =
      u.id === currentUser.id
        ? true
        : presenceMap[u.id] !== undefined
        ? presenceMap[u.id]
        : (u.isOnline ?? false);

    // Status filter
    if (statusFilter === 'online' && !isUserOnline) return false;
    if (statusFilter === 'offline' && isUserOnline) return false;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = u.name.toLowerCase().includes(term);
      const matchEmail = (u.email || '').toLowerCase().includes(term);
      return matchName || matchEmail;
    }

    return true;
  });

  return (
    <div
      className="w-full max-w-2xl mx-auto flex flex-col min-h-screen px-3.5 select-none transition-all"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2rem, 3rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-amber-200/80 mb-4">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onBack();
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title={t.back}
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 font-display font-extrabold text-sm sm:text-base text-indigo-950">
            <span>⚙️</span> {t.developerDashboard}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>{ADMIN_EMAIL}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setRefreshKey((k) => k + 1);
          }}
          className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
          title="Atualizar dados"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Admin Role Badge */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 flex items-center justify-between shadow-sm border border-amber-500/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center text-base shadow-xs">
            👑
          </div>
          <div>
            <div className="text-xs font-bold font-display uppercase tracking-wide">
              {t.adminDeveloper}
            </div>
            <div className="text-[10px] font-sans text-amber-900">
              Acesso total ao Firebase Firestore e status de presença em tempo real
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold font-display bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-xs">
          ATIVO
        </span>
      </div>

      {/* 📊 RESUMO (Summary Cards) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-extrabold font-display uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Activity size={14} className="text-amber-500" />
            <span>📊 {t.summary}</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-sans">
            Firebase em tempo real
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Total Usuários */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-display font-medium text-slate-600">{t.totalUsers}</span>
              <Users size={15} className="text-indigo-500" />
            </div>
            <div className="text-xl font-black font-display text-slate-900 tabular-nums">
              {totalUsersCount}
            </div>
          </div>

          {/* Usuários Online */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] font-display font-medium text-emerald-900">{t.totalOnline}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs"></span>
            </div>
            <div className="text-xl font-black font-display text-emerald-700 tabular-nums">
              {onlineCount}
            </div>
          </div>

          {/* Usuários Offline */}
          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-[11px] font-display font-medium text-rose-900">{t.totalOffline}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            </div>
            <div className="text-xl font-black font-display text-rose-700 tabular-nums">
              {offlineCount}
            </div>
          </div>

          {/* Total Partidas */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-display font-medium text-slate-600">{t.matchesPlayed}</span>
              <Gamepad2 size={15} className="text-amber-500" />
            </div>
            <div className="text-xl font-black font-display text-slate-900 tabular-nums">
              {totalMatchesCount}
            </div>
          </div>
        </div>

        {/* Última Atividade */}
        <div className="mt-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-500" />
            <span>{t.lastActivity}: <strong className="text-slate-800">{lastActivityDisplay}</strong></span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
            ● Heartbeat 20s
          </span>
        </div>
      </div>

      {/* 👥 USUÁRIOS CADASTRADOS (List / Search / Filters) */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-extrabold font-display uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users size={14} className="text-amber-500" />
            <span>👥 {t.registeredUsers} ({filteredUsers.length})</span>
          </h3>

          {/* Filter Buttons: 🟢 Online, 🔴 Offline, 👥 Todos */}
          <div className="flex items-center gap-1 p-1 bg-amber-100/70 rounded-xl border border-amber-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setStatusFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 {t.all}
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setStatusFilter('online');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'online'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{t.online}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setStatusFilter('offline');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'offline'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>{t.offline}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchByName}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Users Cards / Table List */}
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span>Carregando usuários do Firebase...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isUserOnline =
                user.id === currentUser.id
                  ? true
                  : presenceMap[user.id] !== undefined
                  ? presenceMap[user.id]
                  : (user.isOnline ?? false);

              const formattedCreatedAt = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'Recente';

              return (
                <div
                  key={user.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-xs flex flex-col gap-2.5"
                >
                  {/* Top row: Avatar, Name, Email, Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarDisplay
                        avatar={user.avatarId}
                        photoUrl={user.photoUrl}
                        size="sm"
                        shape="circle"
                        className="w-11 h-11 border-2 border-slate-100 rounded-full shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold font-display text-slate-900 truncate">
                            {user.name}
                          </span>
                          {(user.email === ADMIN_EMAIL || user.role === 'admin') && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[9px] uppercase tracking-wider border border-amber-300">
                              Admin
                            </span>
                          )}
                          {user.id === currentUser.id && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              (Você)
                            </span>
                          )}
                        </div>

                        {/* Admin-only viewable Email */}
                        <div className="text-[11px] text-slate-500 font-sans flex items-center gap-1 truncate">
                          <Mail size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{user.email || 'guest@musicalmente.app'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Requirement 4: 🟢 Online (Green circle + Green text) / 🔴 Offline (Red circle + Red text) */}
                    <div className="shrink-0 text-right">
                      <div className="p-1.5 px-2.5 rounded-xl border flex items-center gap-1.5 shadow-2xs font-display text-xs font-bold"
                        style={{
                          backgroundColor: isUserOnline ? '#ecfdf5' : '#fff1f2',
                          borderColor: isUserOnline ? '#a7f3d0' : '#fecdd3',
                        }}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isUserOnline
                              ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className={isUserOnline ? 'text-emerald-700' : 'text-rose-700'}>
                          {isUserOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: Statistics and metadata */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Idioma</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        {user.language === 'pt-BR' ? '🇧🇷 PT-BR' : user.language === 'fr-CA' ? '🇨🇦 FR-CA' : '🇨🇦 EN-CA'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Cadastro</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar size={11} className="text-slate-400" />
                        {formattedCreatedAt}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Partidas</span>
                      <span className="font-bold text-indigo-900 tabular-nums">
                        {user.totalMatches || 0}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Pontuação / Combo</span>
                      <span className="font-bold text-amber-700 tabular-nums">
                        {user.highScore || 0} pts • {user.maxCombo || 0}x
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 font-display">
                Nenhum usuário encontrado com os filtros selecionados
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="mt-3 text-xs text-amber-600 font-bold hover:underline cursor-pointer"
              >
                Limpar busca e filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
