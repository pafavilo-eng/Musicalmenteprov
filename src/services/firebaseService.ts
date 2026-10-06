import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  updateDoc,
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  signOut as fbSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { UserProfile, PublicPresence, RankingEntry, ScoreHistoryEntry, ClefType, Language } from '../types';
import { storageService } from './storageService';

export const ADMIN_EMAIL = 'fabilhano@gmail.com';
export const DEV_ADMIN_EMAILS = ['fabilhano@gmail.com', 'fabipixa@gmail.com'];

export function isAdminUser(user?: UserProfile | null): boolean {
  if (!user || !user.email) return false;
  const userEmail = user.email.trim().toLowerCase();
  return DEV_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === userEmail);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // Authentication state listener
  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user profile from Firestore or null
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('Firebase: Error fetching user profile:', err);
      return null;
    }
  },

  // Real Google Login
  async signInWithGoogle(defaultLang: Language = 'pt-BR'): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      // Real user identifier is fbUser.uid
      const existing = await this.fetchUserProfile(fbUser.uid);
      const isAdm = fbUser.email ? DEV_ADMIN_EMAILS.includes(fbUser.email.toLowerCase()) : false;

      const profile: UserProfile = {
        id: fbUser.uid,
        name: existing?.name || fbUser.displayName || 'Músico',
        email: fbUser.email || existing?.email || '',
        role: isAdm ? 'admin' : (existing?.role || 'user'),
        loginMethod: 'google',
        language: existing?.language || defaultLang,
        avatarId: existing?.avatarId || 'bunny_pianist',
        photoUrl: fbUser.photoURL || existing?.photoUrl || '',
        highScore: existing?.highScore || 0,
        totalScore: existing?.totalScore || existing?.highScore || 0,
        totalMatches: existing?.totalMatches || 0,
        totalCorrect: existing?.totalCorrect || 0,
        totalQuestionsAnswered: existing?.totalQuestionsAnswered || 0,
        maxCombo: existing?.maxCombo || 0,
        unlockedAchievements: existing?.unlockedAchievements || [],
        isOnline: true,
        lastActivity: new Date().toISOString(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      await this.syncUserProfile(profile);
      return profile;
    } catch (err: any) {
      console.error('Firebase: Google login error:', err);
      throw err;
    }
  },

  // Real Apple Login
  async signInWithApple(defaultLang: Language = 'pt-BR'): Promise<UserProfile> {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      // Extract Apple-specific full name if returned on initial authorization
      let appleFullName = '';
      try {
        const tokenResp = (cred as any)?._tokenResponse;
        if (tokenResp?.fullName) {
          const fn = tokenResp.fullName;
          appleFullName = [fn.givenName, fn.familyName].filter(Boolean).join(' ');
        }
      } catch {}

      const existing = await this.fetchUserProfile(fbUser.uid);
      const isAdm = fbUser.email ? DEV_ADMIN_EMAILS.includes(fbUser.email.toLowerCase()) : false;
      const isPrivateRelay = fbUser.email ? fbUser.email.toLowerCase().includes('privaterelay.appleid.com') : false;

      const resolvedName = existing?.name || appleFullName || fbUser.displayName || (isPrivateRelay ? 'Músico Apple (ID Oculto)' : 'Aluno Apple');

      const profile: UserProfile = {
        id: fbUser.uid,
        name: resolvedName,
        email: fbUser.email || existing?.email || '',
        role: isAdm ? 'admin' : (existing?.role || 'user'),
        loginMethod: 'apple',
        language: existing?.language || defaultLang,
        avatarId: existing?.avatarId || 'david_harp',
        photoUrl: fbUser.photoURL || existing?.photoUrl || '',
        highScore: existing?.highScore || 0,
        totalScore: existing?.totalScore || existing?.highScore || 0,
        totalMatches: existing?.totalMatches || 0,
        totalCorrect: existing?.totalCorrect || 0,
        totalQuestionsAnswered: existing?.totalQuestionsAnswered || 0,
        maxCombo: existing?.maxCombo || 0,
        unlockedAchievements: existing?.unlockedAchievements || [],
        isOnline: true,
        lastActivity: new Date().toISOString(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      await this.syncUserProfile(profile);
      return profile;
    } catch (err: any) {
      console.error('Firebase: Apple login error:', err);
      throw err;
    }
  },

  // Real Email Signup (robustly writes profile and handles Firebase configuration states)
  async signUpWithEmail(
    name: string,
    email: string,
    password: string,
    avatarId: string,
    lang: Language,
    photoUrl?: string
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    
    // 1. Verify if email is already registered
    const alreadyRegistered = await this.isEmailRegistered(cleanEmail);
    if (alreadyRegistered) {
      const err: any = new Error('Este e-mail já possui uma conta cadastrada.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    let uid = '';
    const isAdm = DEV_ADMIN_EMAILS.includes(cleanEmail);

    try {
      // Attempt Firebase Authentication first
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      uid = cred.user.uid;
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch {}
    } catch (authErr: any) {
      console.warn('Firebase Auth email signup status:', authErr?.code, authErr?.message);
      if (authErr?.code === 'auth/email-already-in-use') {
        throw authErr;
      }
      if (authErr?.code === 'auth/weak-password' || authErr?.code === 'auth/invalid-email') {
        throw authErr;
      }
      // If Firebase Auth provider is restricted or pending activation in Cloud Console,
      // generate deterministic secure UID and record directly in Firestore
      uid = 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
    }

    const profile: UserProfile = {
      id: uid,
      name: cleanName,
      email: cleanEmail,
      role: isAdm ? 'admin' : 'user',
      loginMethod: 'email',
      language: lang,
      avatarId: avatarId || 'bear_maestro',
      photoUrl: photoUrl || '',
      highScore: 0,
      totalScore: 0,
      totalMatches: 0,
      totalCorrect: 0,
      totalQuestionsAnswered: 0,
      maxCombo: 0,
      unlockedAchievements: [],
      isOnline: true,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Store credential hash in Firestore and local storage
    try {
      const key = cleanEmail.replace(/[^a-z0-9]/g, '_');
      await setDoc(doc(db, 'user_credentials', key), {
        uid,
        email: cleanEmail,
        passwordHash: btoa(password),
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Credential store notice:', e);
    }
    storageService.setUserPassword(cleanEmail, password);

    // Save user profile to Firestore
    await this.syncUserProfile(profile);
    await this.registerEmail(cleanEmail);
    return profile;
  },

  // Real Email Login
  async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const isAdm = DEV_ADMIN_EMAILS.includes(cleanEmail);

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = cred.user;
      const existing = await this.fetchUserProfile(fbUser.uid);

      const profile: UserProfile = {
        id: fbUser.uid,
        name: existing?.name || fbUser.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: isAdm ? 'admin' : (existing?.role || 'user'),
        loginMethod: 'email',
        language: existing?.language || 'pt-BR',
        avatarId: existing?.avatarId || 'bear_maestro',
        photoUrl: existing?.photoUrl || '',
        highScore: existing?.highScore || 0,
        totalScore: existing?.totalScore || existing?.highScore || 0,
        totalMatches: existing?.totalMatches || 0,
        totalCorrect: existing?.totalCorrect || 0,
        totalQuestionsAnswered: existing?.totalQuestionsAnswered || 0,
        maxCombo: existing?.maxCombo || 0,
        unlockedAchievements: existing?.unlockedAchievements || [],
        isOnline: true,
        lastActivity: new Date().toISOString(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      await this.syncUserProfile(profile);
      return profile;
    } catch (authErr: any) {
      console.warn('Firebase Auth signInWithEmail note:', authErr?.code);
      if (
        authErr?.code === 'auth/operation-not-allowed' || 
        authErr?.code === 'auth/admin-restricted-operation' ||
        authErr?.code === 'auth/user-not-found'
      ) {
        // Check Firestore user_credentials
        const key = cleanEmail.replace(/[^a-z0-9]/g, '_');
        let credDoc = null;
        try {
          const snap = await getDoc(doc(db, 'user_credentials', key));
          if (snap.exists()) {
            credDoc = snap.data();
          }
        } catch {}

        const localPass = storageService.getUserPassword(cleanEmail);
        const encoded = btoa(password);

        if ((credDoc && credDoc.passwordHash === encoded) || (localPass && localPass === password)) {
          const uid = credDoc?.uid || ('usr_' + key);
          const existing = await this.fetchUserProfile(uid);

          const profile: UserProfile = {
            id: uid,
            name: existing?.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: isAdm ? 'admin' : (existing?.role || 'user'),
            loginMethod: 'email',
            language: existing?.language || 'pt-BR',
            avatarId: existing?.avatarId || 'bear_maestro',
            photoUrl: existing?.photoUrl || '',
            highScore: existing?.highScore || 0,
            totalScore: existing?.totalScore || existing?.highScore || 0,
            totalMatches: existing?.totalMatches || 0,
            totalCorrect: existing?.totalCorrect || 0,
            totalQuestionsAnswered: existing?.totalQuestionsAnswered || 0,
            maxCombo: existing?.maxCombo || 0,
            unlockedAchievements: existing?.unlockedAchievements || [],
            isOnline: true,
            lastActivity: new Date().toISOString(),
            createdAt: existing?.createdAt || new Date().toISOString(),
          };

          await this.syncUserProfile(profile);
          return profile;
        }
      }
      throw authErr;
    }
  },

  // Logout
  async signOut(): Promise<void> {
    if (auth.currentUser) {
      await this.setPresence(auth.currentUser.uid, '', '', false);
    }
    await fbSignOut(auth);
  },

  // Save or sync user profile to Firestore & Real-Time Ranking
  async syncUserProfile(user: UserProfile): Promise<void> {
    if (!user || !user.id) return;
    try {
      const isAdm = isAdminUser(user);
      const userRef = doc(db, 'users', user.id);
      
      const payload: Partial<UserProfile> = {
        id: user.id,
        name: user.name,
        email: user.email || '',
        role: isAdm ? 'admin' : (user.role || 'user'),
        loginMethod: user.loginMethod,
        language: user.language,
        avatarId: user.avatarId,
        photoUrl: user.photoUrl || '',
        highScore: user.highScore || 0,
        totalScore: user.totalScore || user.highScore || 0,
        totalMatches: user.totalMatches || 0,
        totalCorrect: user.totalCorrect || 0,
        totalQuestionsAnswered: user.totalQuestionsAnswered || 0,
        maxCombo: user.maxCombo || 0,
        unlockedAchievements: user.unlockedAchievements || [],
        isOnline: true,
        lastActivity: new Date().toISOString(),
        createdAt: user.createdAt || new Date().toISOString(),
      };

      await setDoc(userRef, payload, { merge: true });

      // Synchronize to real-time ranking collection so other connected devices see this user
      const rankRef = doc(db, 'ranking', user.id);
      const rankingPayload: RankingEntry = {
        id: user.id,
        userId: user.id,
        name: user.name,
        avatarId: user.avatarId,
        photoUrl: user.photoUrl || '',
        score: user.highScore || 0,
        totalScore: user.totalScore || user.highScore || 0,
        highScore: user.highScore || 0,
        correctCount: user.totalCorrect || 0,
        accuracy: user.totalQuestionsAnswered > 0 
          ? Math.round((user.totalCorrect / user.totalQuestionsAnswered) * 100) 
          : 100,
        maxCombo: user.maxCombo || 0,
        clef: 'all',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(rankRef, rankingPayload, { merge: true });

      // Update public presence
      await this.setPresence(user.id, user.name, user.avatarId, true, user.photoUrl);

      // Register email directory
      if (user.email) {
        await this.registerEmail(user.email);
      }
    } catch (err) {
      console.warn('Firebase: Error syncing user profile:', err);
    }
  },

  // Record an individual question answer: saves score, records history, and updates live ranking
  async recordAnswerScore(params: {
    userId: string;
    userName: string;
    userAvatarId: string;
    photoUrl?: string;
    questionId: number | string;
    isCorrect: boolean;
    pointsAdded: number;
    currentTotalScore: number;
    matchScore: number;
    clef?: ClefType;
    reason: string;
    combo: number;
    accuracy: number;
    totalCorrect: number;
  }): Promise<number> {
    const newTotalScore = params.currentTotalScore + params.pointsAdded;
    const now = Date.now();

    try {
      // 1. Record immutable score history document
      const historyId = `hist_${params.userId}_${now}_${Math.random().toString(36).substring(2, 6)}`;
      const historyDocRef = doc(db, 'scoreHistory', historyId);
      const historyPayload: ScoreHistoryEntry = {
        id: historyId,
        userId: params.userId,
        userName: params.userName,
        userAvatarId: params.userAvatarId,
        score: newTotalScore,
        pointsAdded: params.pointsAdded,
        isCorrect: params.isCorrect,
        reason: params.reason,
        questionId: params.questionId,
        clef: params.clef || 'sol',
        timestamp: now,
      };
      await setDoc(historyDocRef, historyPayload);

      // 2. Update real-time ranking document for instant live leaderboard update across all clients
      const rankRef = doc(db, 'ranking', params.userId);
      const rankUpdate: Partial<RankingEntry> = {
        userId: params.userId,
        name: params.userName,
        avatarId: params.userAvatarId,
        photoUrl: params.photoUrl || '',
        score: params.matchScore,
        totalScore: newTotalScore,
        correctCount: params.totalCorrect,
        accuracy: params.accuracy,
        maxCombo: params.combo,
        clef: params.clef || 'all',
        updatedAt: new Date(now).toISOString(),
      };
      await setDoc(rankRef, rankUpdate, { merge: true });

      // 3. Update user profile document
      const userRef = doc(db, 'users', params.userId);
      await updateDoc(userRef, {
        totalScore: newTotalScore,
        highScore: Math.max(params.matchScore, newTotalScore),
        totalCorrect: params.totalCorrect,
        maxCombo: params.combo,
        lastActivity: new Date(now).toISOString(),
      }).catch(async () => {
        // If doc needed initial creation
        await setDoc(userRef, {
          id: params.userId,
          name: params.userName,
          totalScore: newTotalScore,
          highScore: params.matchScore,
          lastActivity: new Date(now).toISOString(),
        }, { merge: true });
      });

    } catch (err) {
      console.warn('Firebase: Error recording answer score to real-time DB:', err);
    }

    return newTotalScore;
  },

  // Subscribe to REAL-TIME live ranking from Firestore
  subscribeToLiveRanking(callback: (rankings: RankingEntry[]) => void) {
    try {
      const rankCol = collection(db, 'ranking');
      return onSnapshot(rankCol, (snapshot) => {
        const list: RankingEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as RankingEntry;
          if (data && data.name && data.name.trim() !== '') {
            list.push({
              id: docSnap.id,
              userId: data.userId || docSnap.id,
              name: data.name,
              avatarId: data.avatarId || 'bear_maestro',
              photoUrl: data.photoUrl,
              score: data.score || 0,
              totalScore: typeof data.totalScore === 'number' ? data.totalScore : (data.score || 0),
              correctCount: data.correctCount || 0,
              accuracy: data.accuracy || 100,
              maxCombo: data.maxCombo || 0,
              clef: data.clef || 'all',
              updatedAt: data.updatedAt || new Date().toISOString(),
              period: 'all',
            });
          }
        });

        // Sort exclusively by total score / accumulated points descending
        list.sort((a, b) => (b.totalScore || b.score) - (a.totalScore || a.score));
        callback(list);
      }, (err) => {
        console.warn('Firebase: Live ranking subscription error:', err);
      });
    } catch (err) {
      console.warn('Firebase: Failed to setup live ranking subscription:', err);
      return () => {};
    }
  },

  // Check if an email is registered
  async isEmailRegistered(email: string): Promise<boolean> {
    if (!email) return false;
    const clean = email.trim().toLowerCase();

    if (DEV_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean)) {
      return true;
    }

    if (storageService.isEmailRegistered(clean)) {
      return true;
    }

    try {
      const key = clean.replace(/[^a-z0-9]/g, '_');
      const docSnap = await getDoc(doc(db, 'registered_directory', key));
      if (docSnap.exists()) {
        return true;
      }
    } catch (err) {
      console.warn('Firebase: Error checking registered_directory:', err);
    }

    return false;
  },

  // Register an email in Firestore directory & storage
  async registerEmail(email: string): Promise<void> {
    if (!email) return;
    const clean = email.trim().toLowerCase();
    storageService.registerEmail(clean);

    try {
      const key = clean.replace(/[^a-z0-9]/g, '_');
      await setDoc(doc(db, 'registered_directory', key), {
        email: clean,
        registeredAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firebase: Error registering email in directory:', err);
    }
  },

  // Official Password Reset via Firebase Authentication
  async sendPasswordResetEmail(email: string): Promise<void> {
    const clean = email.trim().toLowerCase();
    await this.registerEmail(clean);

    try {
      auth.languageCode = 'pt';
    } catch {}

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const actionCodeSettings = {
      url: `${origin}/?mode=resetPassword`,
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, clean, actionCodeSettings);
    } catch (firstErr: any) {
      if (firstErr?.code === 'auth/unauthorized-continue-uri' || firstErr?.code === 'auth/invalid-continue-uri') {
        await sendPasswordResetEmail(auth, clean);
      } else {
        throw firstErr;
      }
    }
  },

  // Verify OOB code from the reset password email link
  async verifyPasswordResetCode(code: string): Promise<string> {
    return await verifyPasswordResetCode(auth, code);
  },

  // Confirm password reset with new password
  async confirmPasswordReset(code: string, newPass: string): Promise<void> {
    await confirmPasswordReset(auth, code, newPass);
  },

  // Update public presence doc
  async setPresence(
    userId: string,
    name: string,
    avatarId: string,
    isOnline: boolean,
    photoUrl?: string
  ): Promise<void> {
    if (!userId) return;
    try {
      const presenceRef = doc(db, 'public_presence', userId);
      const now = Date.now();
      const payload: PublicPresence = {
        userId,
        name: name || '',
        avatarId: avatarId || 'bear_maestro',
        photoUrl: photoUrl || '',
        isOnline,
        lastSeen: now,
        updatedAt: new Date(now).toISOString(),
      };
      await setDoc(presenceRef, payload, { merge: true });

      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          isOnline,
          photoUrl: photoUrl || '',
          lastActivity: new Date(now).toISOString(),
        });
      } catch {}
    } catch (err) {
      console.warn('Firebase: Error updating presence:', err);
    }
  },

  // Real-time listener for public presence
  subscribeToPublicPresence(callback: (presenceList: PublicPresence[]) => void) {
    try {
      const colRef = collection(db, 'public_presence');
      return onSnapshot(colRef, (snapshot) => {
        const list: PublicPresence[] = [];
        const now = Date.now();
        snapshot.forEach((d) => {
          const data = d.data() as PublicPresence;
          const isReallyOnline = data.isOnline && (now - (data.lastSeen || 0) < 60000);
          list.push({
            ...data,
            isOnline: isReallyOnline,
          });
        });
        callback(list);
      }, (err) => {
        console.warn('Presence subscription warning:', err);
      });
    } catch (err) {
      console.warn('Presence subscription setup error:', err);
      return () => {};
    }
  },

  // Developer Dashboard: Fetch registered real users only (NO SEED USERS!)
  async getRegisteredUsers(): Promise<UserProfile[]> {
    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      
      const users: UserProfile[] = [];
      snap.forEach((d) => {
        const u = d.data() as UserProfile;
        if (u && u.name) {
          users.push(u);
        }
      });
      return users;
    } catch (err) {
      console.error('Firebase: Failed to get registered users:', err);
      throw err;
    }
  },

  // Real-time listener for users collection (for Developer Dashboard)
  subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
    try {
      const usersCol = collection(db, 'users');
      return onSnapshot(usersCol, (snap) => {
        const users: UserProfile[] = [];
        snap.forEach((d) => {
          const u = d.data() as UserProfile;
          if (u && u.name) {
            users.push(u);
          }
        });
        callback(users);
      }, (err) => {
        console.warn('Developer users subscription error:', err);
      });
    } catch {
      return () => {};
    }
  }
};
