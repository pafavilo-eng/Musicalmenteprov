import React, { useState } from 'react';
import { Language, SoundSettings, UserProfile } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { soundService } from '../services/soundService';
import { getAvatarById } from '../data/avatars';
import { AvatarDisplay } from './AvatarDisplay';
import { AvatarPickerModal } from './AvatarPickerModal';
import { ProfilePhotoPickerModal } from './ProfilePhotoPickerModal';
import { LanguageSelector } from './LanguageSelector';
import { User, ArrowLeft, Edit3, Trophy, Flame, CheckCircle, ShieldCheck, Camera, Sparkles, Star } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { ScoreTrophyBadge } from './ScoreTrophyBadge';
import { calculateScoreTrophy, getUserTotalScore } from '../services/scoreTrophyService';

interface ProfileViewProps {
  currentUser: UserProfile;
  lang: Language;
  soundSettings: SoundSettings;
  onUpdateUser: (user: UserProfile) => void;
  onUpdateSoundSettings: (settings: SoundSettings) => void;
  onSelectLang: (lang: Language) => void;
  onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  lang,
  soundSettings,
  onUpdateUser,
  onUpdateSoundSettings,
  onSelectLang,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  const t = TRANSLATIONS[lang];
  const avatar = getAvatarById(currentUser.avatarId);

  const handleSave = () => {
    soundService.playTap();
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || currentUser.name,
    };
    onUpdateUser(updated);
    firebaseService.syncUserProfile(updated);
    setIsEditing(false);
  };

  const handleSelectAvatar = (newAvatarId: string) => {
    soundService.playTap();
    const updated: UserProfile = {
      ...currentUser,
      avatarId: newAvatarId,
    };
    onUpdateUser(updated);
    firebaseService.syncUserProfile(updated);
  };

  const handleSavePhoto = (photoUrl: string) => {
    soundService.playAchievement();
    const updated: UserProfile = {
      ...currentUser,
      photoUrl,
    };
    onUpdateUser(updated);
    firebaseService.syncUserProfile(updated);
  };

  const handleRemovePhoto = () => {
    soundService.playTap();
    const updated: UserProfile = {
      ...currentUser,
      photoUrl: undefined,
    };
    onUpdateUser(updated);
    firebaseService.syncUserProfile(updated);
  };

  return (
    <div
      className="w-full max-w-md mx-auto flex flex-col min-h-screen px-3.5 pt-3 select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2rem, 3rem)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 0.875rem)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 0.875rem)',
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            onBack();
          }}
          className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 shadow-sm border border-slate-200 cursor-pointer transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5">
          <User className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold font-display text-indigo-950">
            {t.myProfile}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setIsEditing(!isEditing);
          }}
          className="text-xs font-display font-bold text-amber-700 hover:text-amber-900 px-2.5 py-1.5 rounded-xl bg-amber-100/70 border border-amber-200 cursor-pointer"
        >
          {isEditing ? t.cancel : t.editProfile}
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="card-clay rounded-3xl p-5 mb-4 text-center">
        {/* Avatar / Photo with Perfect Circular Styling */}
        <div className="relative inline-block mx-auto mb-3">
          <AvatarDisplay
            avatar={avatar}
            photoUrl={currentUser.photoUrl}
            size="2xl"
            shape="circle"
            className="w-24 h-24 rounded-full border-4 border-amber-300 shadow-xl"
          />
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setShowPhotoPicker(true);
            }}
            className="absolute -bottom-1 -right-1 p-2 rounded-full bg-amber-400 text-amber-950 shadow-md border-2 border-white hover:bg-amber-500 transition-colors cursor-pointer"
            title="Tirar foto ou escolher da galeria"
          >
            <Camera size={14} />
          </button>
        </div>

        {/* Profile Picture & Avatar Action Buttons */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setShowPhotoPicker(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-display font-bold text-[11px] border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <Camera size={13} />
            <span>{currentUser.photoUrl ? 'Trocar Foto' : 'Tirar / Escolher Foto'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setShowAvatarPicker(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-display font-bold text-[11px] border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Avatares 3D</span>
          </button>
        </div>

        {/* Name / Edit Form */}
        {isEditing ? (
          <div className="space-y-2 max-w-xs mx-auto mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-center font-display font-bold text-base px-3 py-1.5 rounded-xl border-2 border-amber-400 focus:outline-none bg-white"
            />
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-display font-bold text-xs cursor-pointer shadow-sm"
            >
              {t.saveChanges}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <h3 className="font-display font-black text-2xl text-indigo-950">
                {currentUser.name}
              </h3>
              <ScoreTrophyBadge user={currentUser} size="xs" variant="pill" />
            </div>
            <p className="text-xs sm:text-sm text-amber-800 font-semibold mt-0.5">
              {currentUser.photoUrl ? 'Foto Personalizada' : avatar.name} • {avatar.instrumentOrRole}
            </p>
          </div>
        )}
      </div>

      {/* 🏆 CONQUISTA POR PONTOS (MEDALHAS & TROFÉUS ACUMULÁVEIS) */}
      <div className="mb-4">
        <ScoreTrophyBadge user={currentUser} variant="card" />

        {/* Progress details to next trophy/medal */}
        {(() => {
          const totalPts = getUserTotalScore(currentUser);
          const trophyInfo = calculateScoreTrophy(totalPts);
          if (!trophyInfo.nextGoal) return null;
          const { targetPoints, pointsRemaining, nextTierName } = trophyInfo.nextGoal;
          const prevBase = trophyInfo.type === 'none' ? 0 : trophyInfo.type === 'bronze' ? 5000 : trophyInfo.type === 'silver' ? 10000 : trophyInfo.goldCount * 15000;
          const progressPercent = Math.min(100, Math.max(0, ((totalPts - prevBase) / (targetPoints - prevBase)) * 100));

          return (
            <div className="mt-2 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold font-display text-slate-700 mb-1.5">
                <span>Próxima Meta: {nextTierName}</span>
                <span className="text-amber-800 font-black tabular-nums">
                  Faltam {pointsRemaining.toLocaleString()} pts
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Total Score */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
            <Star size={20} className="fill-amber-400 text-amber-500" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase">{t.totalAccumulatedScore}</div>
            <div className="text-lg font-black font-display text-slate-900 tabular-nums">
              {getUserTotalScore(currentUser).toLocaleString()}
            </div>
          </div>
        </div>

        {/* High Score */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center shrink-0 border border-yellow-200">
            <Trophy size={20} className="text-amber-600" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase">{t.highestScore}</div>
            <div className="text-lg font-black font-display text-slate-900 tabular-nums">
              {(currentUser.highScore || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Total Matches */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200 text-lg">
            🎮
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase">{t.totalMatches}</div>
            <div className="text-lg font-black font-display text-slate-900 tabular-nums">
              {currentUser.totalMatches}
            </div>
          </div>
        </div>

        {/* Total Correct */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold uppercase">{t.totalCorrect}</div>
            <div className="text-lg font-black font-display text-slate-900 tabular-nums">
              {currentUser.totalCorrect}
            </div>
          </div>
        </div>

        {/* Max Combo */}
        <div className="col-span-2 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 border border-orange-200">
            <Flame size={20} />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-bold uppercase">{t.highestCombo}</div>
              <div className="text-lg font-black font-display text-slate-900 tabular-nums">
                {currentUser.maxCombo}x Sequência Perfeita
              </div>
            </div>
            <ScoreTrophyBadge user={currentUser} size="sm" variant="pill" />
          </div>
        </div>
      </div>

      {/* Language Preference Section */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-4">
        <label className="block text-xs font-bold font-display text-slate-800 mb-2">
          🌎 {t.languageSelect}
        </label>
        <div className="w-full flex justify-center">
          <LanguageSelector currentLang={lang} onSelectLang={onSelectLang} />
        </div>
      </div>

      {/* Privacy note */}
      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-[10px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t.privacyNotice}</span>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPickerModal
          currentAvatarId={currentUser.avatarId}
          lang={lang}
          onSelectAvatar={handleSelectAvatar}
          onOpenPhotoPicker={() => {
            setShowAvatarPicker(false);
            setShowPhotoPicker(true);
          }}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      {/* Profile Photo Picker Modal */}
      {showPhotoPicker && (
        <ProfilePhotoPickerModal
          currentPhotoUrl={currentUser.photoUrl}
          onSavePhoto={handleSavePhoto}
          onRemovePhoto={handleRemovePhoto}
          onClose={() => setShowPhotoPicker(false)}
        />
      )}
    </div>
  );
};
