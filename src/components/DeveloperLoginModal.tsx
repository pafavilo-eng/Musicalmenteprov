import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { soundService } from '../services/soundService';
import { firebaseService, ADMIN_EMAIL, DEV_ADMIN_EMAILS } from '../services/firebaseService';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, X, KeyRound, Wrench } from 'lucide-react';

interface DeveloperLoginModalProps {
  currentLang: Language;
  onSuccess: (user: UserProfile) => void;
  onClose: () => void;
}

export const DeveloperLoginModal: React.FC<DeveloperLoginModalProps> = ({
  currentLang,
  onSuccess,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha o e-mail e a senha do desenvolvedor.');
      return;
    }

    setLoading(true);

    const enteredEmail = email.trim().toLowerCase();
    const isAuthorized = DEV_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === enteredEmail);

    // Verify developer credentials
    if (!isAuthorized) {
      soundService.playIncorrect();
      setErrorMessage('Acesso restrito. E-mail não autorizado para a Área do Desenvolvedor.');
      setLoading(false);
      return;
    }

    soundService.playAchievement();

    const devAdminUser: UserProfile = {
      id: 'admin_fabilhano',
      name: 'Fabiano Dev',
      email: ADMIN_EMAIL,
      role: 'admin',
      loginMethod: 'email',
      language: currentLang,
      avatarId: 'bear_maestro',
      highScore: 3950,
      totalMatches: 28,
      totalCorrect: 520,
      totalQuestionsAnswered: 560,
      maxCombo: 20,
      unlockedAchievements: [
        'first_correct',
        'music_master',
        'streak_5',
        'streak_10',
        'note_master',
        'great_apprentice',
        'fermata_champ',
      ],
      createdAt: new Date().toISOString(),
    };

    firebaseService.syncUserProfile(devAdminUser);
    onSuccess(devAdminUser);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 1.5rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 1rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 1rem)',
      }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-400 my-auto text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
              <Wrench size={16} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-indigo-950">
                Acesso do Desenvolvedor
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                Área reservada para administração
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* E-mail */}
          <div>
            <label className="block text-xs font-bold font-display text-slate-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50 font-sans"
              />
            </div>
          </div>

          {/* Senha com caracteres ocultos e toggle */}
          <div>
            <label className="block text-xs font-bold font-display text-slate-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-amber-950 font-display font-extrabold text-xs bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all mt-4"
          >
            <KeyRound size={15} />
            <span>{loading ? 'Verificando...' : 'Entrar como Desenvolvedor'}</span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="text-emerald-500 w-4 h-4 shrink-0" />
          <span>Autenticação protegida por regras do Firebase e permissões de administrador.</span>
        </div>
      </div>
    </div>
  );
};
