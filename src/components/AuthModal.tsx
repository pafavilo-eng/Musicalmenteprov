import React, { useState, useEffect } from 'react';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';
import { LanguageSelector } from './LanguageSelector';
import { AvatarPickerModal } from './AvatarPickerModal';
import { ProfilePhotoPickerModal } from './ProfilePhotoPickerModal';
import { DeveloperLoginModal } from './DeveloperLoginModal';
import { AvatarDisplay } from './AvatarDisplay';
import { getAvatarById } from '../data/avatars';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  Wrench, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Camera,
  Volume2,
  VolumeX
} from 'lucide-react';
import { firebaseService, DEV_ADMIN_EMAILS } from '../services/firebaseService';

interface AuthModalProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup' | 'forgot' | 'reset';
  initialResetCode?: string;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentLang,
  onSelectLang,
  onSuccess,
  initialMode = 'login',
  initialResetCode = '',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarId, setAvatarId] = useState('bear_maestro');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [hideAppleEmail, setHideAppleEmail] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showDevLoginModal, setShowDevLoginModal] = useState(false);
  
  // Audio state on login screen (OFF by default, respects user preferences)
  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => {
    return storageService.getSoundSettings().soundEffects && soundService.isAudioActive();
  });

  const handleToggleAudio = () => {
    if (isAudioActive) {
      soundService.disableAudio();
      setIsAudioActive(false);
      storageService.saveSoundSettings({ soundEffects: false, music: false, volume: 0.7 });
    } else {
      soundService.enableAudio();
      setIsAudioActive(true);
      storageService.saveSoundSettings({ soundEffects: true, music: true, volume: 0.7 });
    }
  };
  
  // Feedback states
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset flow states
  const [resetCode, setResetCode] = useState(initialResetCode);
  const [verifiedResetEmail, setVerifiedResetEmail] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const t = TRANSLATIONS[currentLang];
  const selectedAvatar = getAvatarById(avatarId);

  // Update mode or resetCode if props change
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialResetCode) {
      setResetCode(initialResetCode);
      setMode('reset');
    }
  }, [initialResetCode]);

  // Validate reset code when in 'reset' mode
  useEffect(() => {
    if (mode === 'reset') {
      if (!resetCode) {
        setCodeError(t.linkExpiredOrInvalid);
        setIsValidatingCode(false);
        return;
      }
      let isCancelled = false;
      setIsValidatingCode(true);
      setCodeError('');
      setErrorMessage('');
      setSuccessInfo('');

      firebaseService.verifyPasswordResetCode(resetCode)
        .then((userEmail) => {
          if (!isCancelled) {
            setVerifiedResetEmail(userEmail);
            setIsValidatingCode(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            console.warn('Firebase: verifyPasswordResetCode error:', err);
            setCodeError(t.linkExpiredOrInvalid);
            setIsValidatingCode(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }
  }, [mode, resetCode, t.linkExpiredOrInvalid]);

  // Real Google Login
  const handleGoogleAuth = async () => {
    soundService.playTap();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const googleUser = await firebaseService.signInWithGoogle(currentLang);
      soundService.playAchievement();
      onSuccess(googleUser);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      soundService.playIncorrect();
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela de autenticação Google foi fechada antes da conclusão.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('O navegador bloqueou a abertura do popup. Permita popups para continuar.');
      } else if (err?.code === 'auth/network-request-failed') {
        setErrorMessage('Erro de conexão. Verifique sua conexão à internet.');
      } else {
        setErrorMessage(err?.message || 'Erro ao conectar com Google. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real Apple Login
  const handleAppleAuth = async () => {
    soundService.playTap();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const appleUser = await firebaseService.signInWithApple(currentLang);
      soundService.playAchievement();
      onSuccess(appleUser);
    } catch (err: any) {
      console.error('Apple Auth Error:', err);
      soundService.playIncorrect();
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela de autenticação Apple foi fechada antes da conclusão.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('O navegador bloqueou a abertura do popup. Permita popups para continuar.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setErrorMessage('Provedor Apple ainda não ativado no console Firebase.');
      } else {
        setErrorMessage(err?.message || 'Erro ao autenticar com Apple. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email Signup / Login / Forgot Password handler
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo('');

    if (mode === 'signup') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        soundService.playIncorrect();
        setErrorMessage(t.fillAllFields);
        return;
      }
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        soundService.playIncorrect();
        setErrorMessage(t.invalidEmailAddress);
        return;
      }
      if (password.length < 6) {
        soundService.playIncorrect();
        setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        soundService.playIncorrect();
        setErrorMessage(t.passwordsMustMatch);
        return;
      }

      setIsSubmitting(true);
      try {
        const newUser = await firebaseService.signUpWithEmail(
          name.trim(),
          cleanEmail,
          password,
          avatarId,
          currentLang,
          photoUrl
        );
        soundService.playAchievement();
        onSuccess(newUser);
      } catch (err: any) {
        console.error('Signup error:', err);
        soundService.playIncorrect();
        if (err?.code === 'auth/email-already-in-use') {
          setErrorMessage('Este e-mail já possui uma conta cadastrada. Faça login ou use "Esqueci minha senha".');
        } else if (err?.code === 'auth/weak-password') {
          setErrorMessage('Senha fraca. Utilize ao menos 6 caracteres.');
        } else if (err?.code === 'auth/invalid-email') {
          setErrorMessage(t.invalidEmailAddress);
        } else {
          setErrorMessage(err?.message || 'Erro ao criar conta real. Tente novamente.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        soundService.playIncorrect();
        setErrorMessage(t.fillAllFields);
        return;
      }
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        soundService.playIncorrect();
        setErrorMessage(t.invalidEmailAddress);
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await firebaseService.signInWithEmail(cleanEmail, password);
        soundService.playAchievement();
        onSuccess(user);
      } catch (err: any) {
        console.error('Login error:', err);
        soundService.playIncorrect();
        if (
          err?.code === 'auth/user-not-found' || 
          err?.code === 'auth/wrong-password' || 
          err?.code === 'auth/invalid-credential'
        ) {
          setErrorMessage('E-mail ou senha incorretos. Verifique os dados ou utilize "Esqueci minha senha".');
        } else if (err?.code === 'auth/too-many-requests') {
          setErrorMessage('Muitas tentativas com erro. Aguarde alguns instantes e tente novamente.');
        } else {
          setErrorMessage(err?.message || 'Erro ao realizar login. Tente novamente.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        soundService.playIncorrect();
        setErrorMessage(t.fillAllFields);
        return;
      }
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        soundService.playIncorrect();
        setErrorMessage(t.invalidEmailAddress);
        return;
      }

      setIsSubmitting(true);
      try {
        // 1. Verify if email is registered in system
        const isRegistered = await firebaseService.isEmailRegistered(cleanEmail);
        if (!isRegistered) {
          soundService.playIncorrect();
          setErrorMessage(t.emailNotRegistered);
          setIsSubmitting(false);
          return;
        }

        // 2. Real call to send official Firebase password reset email
        await firebaseService.sendPasswordResetEmail(cleanEmail);
        soundService.playAchievement();
        setSuccessInfo(t.emailSentSuccess);
      } catch (err: any) {
        console.error('Error sending reset email:', err);
        soundService.playIncorrect();
        if (err?.code === 'auth/user-not-found') {
          setErrorMessage(t.emailNotRegistered);
        } else if (err?.code === 'auth/invalid-email') {
          setErrorMessage(t.invalidEmailAddress);
        } else if (err?.code === 'auth/too-many-requests') {
          setErrorMessage('Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.');
        } else {
          setErrorMessage(t.errorSendingEmail);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Submit handler for resetting password with new credentials
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo('');

    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      soundService.playIncorrect();
      setErrorMessage(t.fillAllFields);
      return;
    }
    if (newPassword.length < 6) {
      soundService.playIncorrect();
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      soundService.playIncorrect();
      setErrorMessage(t.passwordsMustMatch);
      return;
    }

    setIsSubmitting(true);
    try {
      await firebaseService.confirmPasswordReset(resetCode, newPassword);
      
      // Save updated password in local credentials
      if (verifiedResetEmail) {
        storageService.setUserPassword(verifiedResetEmail, newPassword);
      }
      
      soundService.playAchievement();
      setResetSuccess(true);
      setSuccessInfo(t.newPasswordSaved);

      // Auto redirect to login after brief feedback
      setTimeout(() => {
        setEmail(verifiedResetEmail);
        setPassword('');
        setConfirmPassword('');
        setResetSuccess(false);
        setMode('login');
        setSuccessInfo('Senha redefinida com sucesso! Digite sua nova senha para entrar.');
      }, 2500);
    } catch (err: any) {
      console.error('Error confirming password reset:', err);
      soundService.playIncorrect();
      if (err?.code === 'auth/invalid-action-code' || err?.code === 'auth/expired-action-code') {
        setCodeError(t.linkExpiredOrInvalid);
      } else {
        setErrorMessage(t.errorSendingEmail);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-blue-950/90 via-slate-900/90 to-blue-900/90 backdrop-blur-md overflow-y-auto"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.75rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.75rem)',
      }}
    >
      {/* Playful Floating Music Notes & Sparkles in Backdrop */}
      <span className="pointer-events-none absolute top-10 left-8 text-3xl opacity-35 animate-float-note">🎵</span>
      <span className="pointer-events-none absolute bottom-16 right-10 text-3xl opacity-30 animate-float-note" style={{ animationDelay: '1.5s' }}>🎶</span>
      <span className="pointer-events-none absolute top-1/4 right-8 text-2xl opacity-25 animate-float-note" style={{ animationDelay: '0.8s' }}>𝄞</span>
      <span className="pointer-events-none absolute bottom-1/4 left-10 text-2xl opacity-25 animate-float-note" style={{ animationDelay: '2.1s' }}>⭐</span>

      {/* Main Login Card - Azul Padrão Theme */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/98 rounded-[32px] p-5 sm:p-6 shadow-2xl border-4 border-blue-400 my-auto overflow-hidden box-border">
        {/* Decorative Blue Ribbon at Top of Card */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-700" />

        {/* Top Control Bar: Audio Button + Language Selector + Discreet Developer Button */}
        <div className="w-full flex items-center justify-between mb-3 pt-1">
          {/* Sound Toggle Button directly on login screen (Accessible, OFF by default) */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300/60'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200'
            }`}
            title={isAudioActive ? '🔊 Som ativado (Toque para desativar)' : '🔇 Som desativado (Toque para ativar)'}
            aria-label={isAudioActive ? 'Som ativado' : 'Som desativado'}
          >
            {isAudioActive ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          
          <div className="flex justify-center px-1">
            <LanguageSelector currentLang={currentLang} onSelectLang={onSelectLang} compact />
          </div>

          {/* Discreet Developer Access Icon */}
          <button
            type="button"
            onClick={() => {
              if (isAudioActive) soundService.playTap();
              setShowDevLoginModal(true);
            }}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-100/60 flex items-center justify-center transition-colors cursor-pointer"
            title="Acesso Técnico"
            aria-label="Acesso Técnico"
          >
            <Wrench size={16} />
          </button>
        </div>

        {/* Prominent Musical Brand Hero */}
        <div className="text-center mb-3">
          {/* Logo Musicalmente (Blue Icon Form) */}
          <div className="relative inline-block mx-auto mb-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center shadow-lg border-4 border-white/90">
              <span className="text-3xl sm:text-4xl animate-bounce">🎵</span>
            </div>
            <span className="absolute -top-2 -right-2 text-xl animate-float-note">✨</span>
            <span className="absolute -bottom-1 -left-2 text-lg animate-float-note" style={{ animationDelay: '1s' }}>🎶</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 mt-1">
            <span className="text-blue-600">QUIZ</span>
            <span className="text-slate-800"> MUSICAL</span>
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            {mode === 'forgot'
              ? 'Recuperar Acesso à Conta'
              : mode === 'reset'
              ? 'Redefinição de Senha'
              : t.loginSubtitle}
          </p>

          {/* Educational Pill Badge */}
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100/80 text-blue-900 font-bold text-[11px] border border-blue-300/80">
            <Sparkles size={11} className="text-blue-600" />
            <span>{t.loginQuizBadge}</span>
          </div>
        </div>

        {/* Social Quick Login Buttons (Only in Login or Signup mode) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="space-y-2 mb-3">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl border-2 border-slate-200/90 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t.continueWithGoogle}</span>
            </button>

            {/* Apple Sign In */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleAppleAuth}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm active:scale-98 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.85-10.45-12.24-21.73-16.16-33.84-3.92-12.11-5.88-23.47-5.88-34.07 0-14.35 3.8-26.24 11.41-35.65 7.61-9.42 17.18-14.24 28.7-14.48 4.79 0 10.12 1.25 16 3.75 5.88 2.5 9.77 3.81 11.66 3.92 1.63 0 5.66-1.36 12.09-4.08 6.42-2.72 11.85-3.96 16.29-3.75 12.4.65 22.42 5.16 30.06 13.54-10.88 6.53-16.1 15.56-15.66 27.1.44 9.14 4.08 16.7 10.93 22.68 6.85 5.99 14.85 9.47 24.01 10.45-2.07 6.42-4.52 12.74-7.36 18.96zM119.22 31.84c0-7.72 2.77-14.85 8.32-21.38 5.55-6.53 12.4-10.45 20.55-11.75.22 1.09.33 2.18.33 3.26 0 7.61-2.94 14.96-8.81 22.05-5.87 7.07-12.89 11.09-21.05 12.07-.44-1.31-.66-2.5-.66-4.25z" />
                </svg>
                <span>{t.continueWithApple}</span>
              </button>

              {/* Kid Safety Note for Apple Hide Email */}
              <label className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={hideAppleEmail}
                  onChange={(e) => setHideAppleEmail(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-3 h-3"
                />
                <span>{t.appleHideEmail}</span>
              </label>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-2 text-[10px] uppercase font-black tracking-wider text-slate-400">
                OU COM E-MAIL
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>
          </div>
        )}

        {/* Mode Selector Tabs (Login / Signup) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="flex rounded-2xl bg-amber-100/70 p-1 mb-3">
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setMode('login');
                setErrorMessage('');
                setSuccessInfo('');
              }}
              className={`flex-1 py-1.5 text-xs font-black font-display rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-amber-900/80 hover:text-amber-950'
              }`}
            >
              {t.alreadyHaveAccount}
            </button>
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setMode('signup');
                setErrorMessage('');
                setSuccessInfo('');
              }}
              className={`flex-1 py-1.5 text-xs font-black font-display rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-amber-900/80 hover:text-amber-950'
              }`}
            >
              {t.createAccount}
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-medium flex items-start gap-2 animate-shake">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Global Success Banner */}
        {successInfo && (
          <div className="mb-3 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 text-xs font-medium flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{successInfo}</div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE: RESET PASSWORD (FROM EMAIL LINK) */}
        {/* ======================================================== */}
        {mode === 'reset' && (
          <div className="space-y-3">
            {isValidatingCode ? (
              <div className="text-center py-6">
                <Loader2 className="w-9 h-9 animate-spin text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Validando link de redefinição...</p>
                <p className="text-[11px] text-slate-400 mt-1">Conectando com o Firebase...</p>
              </div>
            ) : codeError ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2.5 border-2 border-rose-300">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-sm font-black font-display text-rose-800 mb-1">
                  {codeError}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  O link de redefinição expirou, já foi utilizado ou está incorreto. Por segurança, solicite um novo link abaixo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTap();
                    setCodeError('');
                    setMode('forgot');
                  }}
                  className="w-full py-3 px-4 rounded-2xl text-white font-display font-black text-xs btn-3d-amber cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>{t.requestNewLink}</span>
                  <span>✉️</span>
                </button>
              </div>
            ) : resetSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 border-2 border-emerald-300">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-sm font-black font-display text-emerald-800 mb-1">
                  {t.newPasswordSaved}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Sua nova senha foi salva. Você já pode acessar sua conta!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTap();
                    setEmail(verifiedResetEmail);
                    setPassword('');
                    setResetSuccess(false);
                    setMode('login');
                  }}
                  className="w-full py-3 px-4 rounded-2xl text-white font-display font-black text-xs btn-3d-amber cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>{t.backToLogin}</span>
                  <span>🎵</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[11px] font-bold text-amber-900 block">Redefinindo senha para:</span>
                  <span className="text-xs font-black text-slate-800 font-mono break-all">{verifiedResetEmail}</span>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-black font-display text-slate-700 mb-1 flex items-center gap-1">
                    <span>🔒</span> {t.newPasswordTitle}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center pointer-events-none">
                      <Lock size={13} />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      className="w-full pl-10 pr-9 py-2 text-xs rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 bg-amber-50/40 transition-colors font-medium text-slate-800 placeholder-slate-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title={showNewPassword ? 'Ocultar' : 'Ver'}
                    >
                      {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-black font-display text-slate-700 mb-1 flex items-center gap-1">
                    <span>🔑</span> {t.confirmPassword}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center pointer-events-none">
                      <KeyRound size={13} />
                    </div>
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full pl-10 pr-9 py-2 text-xs rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 bg-amber-50/40 transition-colors font-medium text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                      title={showConfirmNewPassword ? 'Ocultar' : 'Ver'}
                    >
                      {showConfirmNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl text-white font-display font-black text-xs sm:text-sm btn-3d-amber cursor-pointer mt-2 shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>{t.saveNewPassword}</span>
                      <span>🔐</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE: FORGOT PASSWORD */}
        {/* ======================================================== */}
        {mode === 'forgot' && (
          <form onSubmit={handleSubmitEmail} className="space-y-3">
            <div className="text-center px-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.resetPasswordInstructions}
              </p>
            </div>

            <div>
              <label className="block text-xs font-black font-display text-slate-700 mb-1 flex items-center gap-1">
                <span>✉️</span> {t.email}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center pointer-events-none">
                  <Mail size={13} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 bg-amber-50/40 transition-colors font-medium text-slate-800 placeholder-slate-400"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl text-white font-display font-black text-xs sm:text-sm btn-3d-amber cursor-pointer mt-2 shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enviando link...</span>
                </>
              ) : (
                <>
                  <span>{t.sendResetLink}</span>
                  <span>✉️</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* MODE: LOGIN OR SIGNUP */}
        {/* ======================================================== */}
        {(mode === 'login' || mode === 'signup') && (
          <form onSubmit={handleSubmitEmail} className="space-y-2.5">
            {/* Avatar & Photo Selector on Signup */}
            {mode === 'signup' && (
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTap();
                      setShowAvatarPicker(true);
                    }}
                    className="relative p-1 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md active:scale-95 transition-transform cursor-pointer"
                    title={t.chooseAvatar}
                  >
                    <AvatarDisplay
                      avatar={avatarId}
                      photoUrl={photoUrl}
                      size="lg"
                      shape="rounded"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTap();
                      setShowPhotoPicker(true);
                    }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:bg-indigo-700"
                    title="Foto Real"
                  >
                    <Camera size={11} />
                  </button>
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-800 font-display">
                    {selectedAvatar?.name || 'Músico'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTap();
                      setShowAvatarPicker(true);
                    }}
                    className="text-[11px] text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Trocar Avatar 3D
                  </button>
                </div>
              </div>
            )}

            {/* Name / Nickname (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-black font-display text-slate-700 mb-1 flex items-center gap-1">
                  <span>👤</span> {t.nameOrNickname}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center pointer-events-none">
                    <User size={13} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome musical"
                    className="w-full pl-10 pr-3 py-2 text-xs rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 bg-amber-50/40 transition-colors font-medium text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-black font-display text-slate-700 mb-1 flex items-center gap-1">
                <span>✉️</span> {t.email}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center pointer-events-none">
                  <Mail size={13} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-10 pr-3 py-2 text-xs rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 bg-amber-50/40 transition-colors font-medium text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black font-display text-slate-700 flex items-center gap-1">
                  <span>🔒</span> {t.password}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      soundService.playTap();
                      setErrorMessage('');
                      setSuccessInfo('');
                      setMode('forgot');
                    }}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer"
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center pointer-events-none">
                  <Lock size={13} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-9 py-2 text-xs rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 bg-amber-50/40 transition-colors font-medium text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only on signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-black font-display text-slate-700 mb-1 flex items-center gap-1">
                  <span>🔑</span> {t.confirmPassword}
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center pointer-events-none">
                    <KeyRound size={13} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-9 py-2 text-xs rounded-2xl border-2 border-amber-200/80 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300/40 bg-amber-50/40 transition-colors font-medium text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl text-white font-display font-black text-xs sm:text-sm btn-3d-amber cursor-pointer mt-3 shadow-md flex items-center justify-center gap-2 active:scale-98 transition-transform disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Carregando...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>ENTRAR NO MUSICALMENTE</span>
                  <span>🎵</span>
                </>
              ) : (
                <>
                  <span>CRIAR MINHA CONTA</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Bottom Navigation Links */}
        <div className="mt-3.5 flex flex-col items-center gap-2 text-xs text-slate-500">
          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setErrorMessage('');
                setSuccessInfo('');
                setMode('login');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>{t.backToLogin}</span>
            </button>
          )}

          {mode === 'reset' && !codeError && !resetSuccess && (
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setErrorMessage('');
                setSuccessInfo('');
                setMode('login');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>{t.backToLogin}</span>
            </button>
          )}
        </div>

        {/* Child Safety Badge */}
        <div className="mt-4 pt-3 border-t-2 border-amber-100 flex items-center justify-center text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="text-emerald-500 w-4 h-4 shrink-0" />
            <span>Ambiente seguro para crianças e jovens. Seus dados estão protegidos.</span>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPickerModal
          currentAvatarId={avatarId}
          lang={currentLang}
          onSelectAvatar={(id) => setAvatarId(id)}
          onOpenPhotoPicker={() => {
            setShowAvatarPicker(false);
            setShowPhotoPicker(true);
          }}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      {/* Photo Picker Modal */}
      {showPhotoPicker && (
        <ProfilePhotoPickerModal
          currentPhotoUrl={photoUrl}
          onSavePhoto={(newPhotoUrl) => setPhotoUrl(newPhotoUrl)}
          onRemovePhoto={() => setPhotoUrl(undefined)}
          onClose={() => setShowPhotoPicker(false)}
        />
      )}

      {/* Developer Login Modal */}
      {showDevLoginModal && (
        <DeveloperLoginModal
          currentLang={currentLang}
          onSuccess={() => {
            setShowDevLoginModal(false);
          }}
          onClose={() => setShowDevLoginModal(false)}
        />
      )}
    </div>
  );
};
