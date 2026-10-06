import React, { useState, useEffect } from 'react';
import { AppTheme, ClefType, Language, MatchResult, ShuffledQuestion, SoundSettings, UserProfile } from './types';
import { DEFAULT_USER, DEFAULT_SOUNDS, storageService } from './services/storageService';
import { soundService } from './services/soundService';
import { selectMatchQuestionsByClef, selectMatchQuestions } from './data/questions';
import { ACHIEVEMENTS } from './data/achievements';
import { MobileHeader } from './components/MobileHeader';
import { DeviceFrame } from './components/DeviceFrame';
import { AuthModal } from './components/AuthModal';
import { HomeHub } from './components/HomeHub';
import { PrepMatchModal } from './components/PrepMatchModal';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { RankingView } from './components/RankingView';
import { AchievementsView } from './components/AchievementsView';
import { HowToPlayView } from './components/HowToPlayView';
import { ProfileView } from './components/ProfileView';
import { SettingsModal } from './components/SettingsModal';
import { SplashScreen } from './components/SplashScreen';
import { OnlineUsersModal } from './components/OnlineUsersModal';
import { DeveloperDashboardView } from './components/DeveloperDashboardView';
import { usePresence } from './services/presenceService';
import { firebaseService, isAdminUser } from './services/firebaseService';
import { getUserTotalScore } from './services/scoreTrophyService';

type AppScreen =
  | 'home'
  | 'quiz'
  | 'result'
  | 'ranking'
  | 'achievements'
  | 'how_to_play'
  | 'profile'
  | 'developer_dashboard';

export default function App() {
  // User profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return storageService.getUser() || DEFAULT_USER;
  });

  // Sound settings (Initially MUTED as required)
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => {
    return storageService.getSoundSettings();
  });

  // Active language
  const [lang, setLang] = useState<Language>(currentUser.language || 'pt-BR');

  // Active Theme ('blue' | 'black' | 'moss_green')
  const [theme, setTheme] = useState<AppTheme>(() => {
    return storageService.getTheme();
  });

  // Apply theme to HTML and Body on change & load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    storageService.saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme: AppTheme = prev === 'blue' ? 'black' : prev === 'black' ? 'moss_green' : 'blue';
      storageService.saveTheme(nextTheme);
      return nextTheme;
    });
  };

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    storageService.saveTheme(newTheme);
  };

  // Screen routing
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    // If user has not registered/logged in, prompt auth
    const stored = storageService.getUser();
    return !stored || stored.id === 'guest_student';
  });
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  // Active Clef selection for the match ('sol' | 'fa' | 'do')
  const [selectedClef, setSelectedClef] = useState<ClefType>('sol');

  // Initialize and maintain automatic presence heartbeat with Firebase
  usePresence(currentUser);

  // Active quiz match data
  const [activeQuestions, setActiveQuestions] = useState<ShuffledQuestion[]>([]);
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);

  // Mobile Device Frame Mode
  const [devicePreviewMode, setDevicePreviewMode] = useState<boolean>(false);

  // Splash Screen on initial app load
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Auth Modal mode & password reset code from action links
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [resetPasswordCode, setResetPasswordCode] = useState<string>('');

  // Handle URL query parameters for password reset links
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashStr = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
      const hashParams = new URLSearchParams(hashStr);

      const modeParam = urlParams.get('mode') || hashParams.get('mode');
      const oobCodeParam = urlParams.get('oobCode') || hashParams.get('oobCode');

      if (modeParam === 'resetPassword' || oobCodeParam) {
        if (oobCodeParam) {
          setResetPasswordCode(oobCodeParam);
          setAuthModalMode('reset');
        } else {
          setAuthModalMode('forgot');
        }
        setShowAuthModal(true);
        setShowSplash(false);
      }
    } catch (e) {
      console.warn('Error reading URL params for password reset:', e);
    }
  }, []);

  // Listen to Firebase Auth state for automatic session restoration
  useEffect(() => {
    const unsub = firebaseService.onAuthChange(async (fbUser) => {
      if (fbUser) {
        const profile = await firebaseService.fetchUserProfile(fbUser.uid);
        if (profile) {
          setCurrentUser(profile);
          storageService.saveUser(profile);
          setShowAuthModal(false);
        }
      }
    });
    return () => unsub();
  }, []);

  // Sync sound settings to service
  useEffect(() => {
    soundService.setSettings(
      soundSettings.soundEffects,
      soundSettings.music,
      soundSettings.volume
    );
  }, [soundSettings]);

  // Initial sync with Firebase on load
  useEffect(() => {
    if (currentUser && currentUser.id && currentUser.id !== 'guest_student') {
      firebaseService.syncUserProfile(currentUser);
    }
  }, [currentUser?.id]);

  // Save user changes to local storage & Firebase
  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    storageService.saveUser(updated);
    if (updated.id && updated.id !== 'guest_student') {
      firebaseService.syncUserProfile(updated);
    }
    if (updated.language && updated.language !== lang) {
      setLang(updated.language);
    }
  };

  // Change Language
  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    const updated = { ...currentUser, language: newLang };
    handleUpdateUser(updated);
  };

  // Update Sound Settings
  const handleUpdateSoundSettings = (updated: SoundSettings) => {
    setSoundSettings(updated);
    storageService.saveSoundSettings(updated);
  };

  // Correct audio toggle: respects mute initially, enables on user click
  const handleToggleSound = () => {
    const willEnable = !soundSettings.soundEffects;
    if (willEnable) {
      soundService.enableAudio();
      const updated: SoundSettings = {
        soundEffects: true,
        music: true,
        volume: soundSettings.volume || 0.7,
      };
      handleUpdateSoundSettings(updated);
    } else {
      soundService.disableAudio();
      const updated: SoundSettings = {
        soundEffects: false,
        music: false,
        volume: soundSettings.volume || 0.7,
      };
      handleUpdateSoundSettings(updated);
    }
  };

  // Start new match preparation (Opens "ESCOLHA A CLAVE")
  const handlePrepMatch = () => {
    setShowPrepModal(true);
  };

  // Confirm start match with chosen Clef: strictly filtered questions!
  const handleStartMatch = (clef: ClefType = 'sol') => {
    setSelectedClef(clef);
    setShowPrepModal(false);

    // Fetch exclusively questions for the selected clef!
    const pool = selectMatchQuestionsByClef(clef, lang, 20);
    setActiveQuestions(pool.questions);
    setCurrentScreen('quiz');
  };

  // Match completed
  const handleFinishMatch = (result: MatchResult) => {
    setLastMatchResult(result);
    storageService.saveMatch(result);

    // Evaluate Achievements
    const unlocked = new Set(currentUser.unlockedAchievements || []);
    if (result.correctCount > 0) unlocked.add('first_correct');
    const newTotalMatches = currentUser.totalMatches + 1;
    if (newTotalMatches >= 5) unlocked.add('music_master');
    if (result.maxCombo >= 5) unlocked.add('streak_5');
    if (result.maxCombo >= 10) unlocked.add('streak_10');
    if (result.correctCount >= 15) unlocked.add('note_master');
    if (result.score >= 2000) unlocked.add('great_apprentice');
    if (result.correctCount === 20) unlocked.add('fermata_champ');
    if (result.accuracy >= 90) unlocked.add('clef_specialist');

    const currentTotal = getUserTotalScore(currentUser);
    const newTotalScore = currentTotal + result.score;

    const updatedUser: UserProfile = {
      ...currentUser,
      totalScore: newTotalScore,
      highScore: Math.max(currentUser.highScore || 0, result.score),
      totalMatches: newTotalMatches,
      totalCorrect: currentUser.totalCorrect + result.correctCount,
      totalQuestionsAnswered: currentUser.totalQuestionsAnswered + result.totalQuestions,
      maxCombo: Math.max(currentUser.maxCombo || 0, result.maxCombo),
      unlockedAchievements: Array.from(unlocked),
    };

    handleUpdateUser(updatedUser);
    setCurrentScreen('result');
  };

  // Auth Success
  const handleAuthSuccess = (user: UserProfile) => {
    const initializedUser: UserProfile = {
      ...user,
      totalScore: getUserTotalScore(user),
    };
    handleUpdateUser(initializedUser);
    setShowAuthModal(false);
  };

  // Logout
  const handleLogout = async () => {
    await firebaseService.signOut();
    storageService.clearUser();
    setCurrentUser(DEFAULT_USER);
    setShowAuthModal(true);
    setCurrentScreen('home');
  };

  return (
    <DeviceFrame
      enabled={devicePreviewMode}
      onToggle={() => setDevicePreviewMode(!devicePreviewMode)}
    >
      <div className="w-full min-h-screen bg-[var(--app-bg,#f0f7ff)] text-[var(--app-text,#0f172a)] flex flex-col font-sans transition-colors duration-200">
        {/* Mobile Header (hidden during active quiz & developer dashboard) */}
        {currentScreen !== 'quiz' && currentScreen !== 'developer_dashboard' && (
          <MobileHeader
            currentUser={currentUser}
            lang={lang}
            soundEffects={soundSettings.soundEffects}
            theme={theme}
            onToggleSound={handleToggleSound}
            onToggleTheme={handleToggleTheme}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenProfile={() => setCurrentScreen('profile')}
          />
        )}

        {/* Screen Routing */}
        <main className="flex-1 flex flex-col">
          {currentScreen === 'home' && (
            <HomeHub
              currentUser={currentUser}
              lang={lang}
              onStartQuiz={handlePrepMatch}
              onOpenRanking={() => setCurrentScreen('ranking')}
              onOpenProfile={() => setCurrentScreen('profile')}
              onOpenAchievements={() => setCurrentScreen('achievements')}
              onOpenHowToPlay={() => setCurrentScreen('how_to_play')}
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenOnlineUsers={() => setShowOnlineModal(true)}
              onOpenDeveloperArea={() => setCurrentScreen('developer_dashboard')}
            />
          )}

          {currentScreen === 'quiz' && (
            <QuizView
              questions={activeQuestions}
              currentUser={currentUser}
              lang={lang}
              selectedClef={selectedClef}
              onFinishMatch={handleFinishMatch}
              onExitQuiz={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'result' && lastMatchResult && (
            <ResultView
              result={lastMatchResult}
              currentUser={currentUser}
              lang={lang}
              selectedClef={selectedClef}
              onPlayAgain={() => handleStartMatch(selectedClef)}
              onViewRanking={() => setCurrentScreen('ranking')}
              onGoHome={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'ranking' && (
            <RankingView
              lang={lang}
              onBack={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'achievements' && (
            <AchievementsView
              currentUser={currentUser}
              lang={lang}
              onBack={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'how_to_play' && (
            <HowToPlayView
              lang={lang}
              onBack={() => setCurrentScreen('home')}
              onStartPlay={handlePrepMatch}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              lang={lang}
              soundSettings={soundSettings}
              onUpdateUser={handleUpdateUser}
              onUpdateSoundSettings={handleUpdateSoundSettings}
              onSelectLang={handleSelectLanguage}
              onBack={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'developer_dashboard' && (
            <DeveloperDashboardView
              currentUser={currentUser}
              lang={lang}
              onBack={() => setCurrentScreen('home')}
            />
          )}
        </main>

        {/* Auth Modal (if user opens, on first access, or via reset password link) */}
        {showAuthModal && (
          <AuthModal
            currentLang={lang}
            onSelectLang={handleSelectLanguage}
            onSuccess={handleAuthSuccess}
            initialMode={authModalMode}
            initialResetCode={resetPasswordCode}
          />
        )}

        {/* Match Preparation Dialog with Clef Selection */}
        {showPrepModal && (
          <PrepMatchModal
            currentUser={currentUser}
            lang={lang}
            onConfirmStart={handleStartMatch}
            onClose={() => setShowPrepModal(false)}
            onSelectLang={handleSelectLanguage}
          />
        )}

        {/* Global Settings Modal */}
        {showSettingsModal && (
          <SettingsModal
            currentLang={lang}
            onSelectLang={handleSelectLanguage}
            theme={theme}
            onSelectTheme={handleSelectTheme}
            soundSettings={soundSettings}
            onUpdateSoundSettings={handleUpdateSoundSettings}
            currentUser={currentUser}
            onLogout={handleLogout}
            devicePreviewMode={devicePreviewMode}
            onToggleDevicePreview={() => setDevicePreviewMode(!devicePreviewMode)}
            onClose={() => setShowSettingsModal(false)}
            onOpenDeveloperArea={() => setCurrentScreen('developer_dashboard')}
          />
        )}

        {/* Online Users Modal (Public view for authenticated users) */}
        {showOnlineModal && (
          <OnlineUsersModal
            currentUser={currentUser}
            lang={lang}
            onClose={() => setShowOnlineModal(false)}
          />
        )}

        {/* 3D Initial Splash Screen */}
        {showSplash && (
          <SplashScreen
            lang={lang}
            onFinish={() => setShowSplash(false)}
          />
        )}
      </div>
    </DeviceFrame>
  );
}
