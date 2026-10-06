import { Language } from '../types';

export interface TranslationSchema {
  appName: string;
  slogan: string;
  tagline: string;
  
  // Navigation & General
  play: string;
  ranking: string;
  profile: string;
  achievements: string;
  howToPlay: string;
  settings: string;
  back: string;
  close: string;
  save: string;
  cancel: string;
  continue: string;
  logout: string;
  guestMode: string;
  
  // Auth Screen
  loginTitle: string;
  loginSubtitle: string;
  loginQuizBadge: string;
  continueWithGoogle: string;
  continueWithApple: string;
  continueWithEmail: string;
  createAccount: string;
  alreadyHaveAccount: string;
  forgotPassword: string;
  nameOrNickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  preferredLanguage: string;
  chooseAvatar: string;
  resetPasswordInstructions: string;
  sendResetLink: string;
  resetLinkSent: string;
  emailSentSuccess: string;
  emailNotRegistered: string;
  invalidEmailAddress: string;
  errorSendingEmail: string;
  linkExpiredOrInvalid: string;
  newPasswordTitle: string;
  saveNewPassword: string;
  newPasswordSaved: string;
  requestNewLink: string;
  backToLogin: string;
  passwordsMustMatch: string;
  fillAllFields: string;
  privacyNotice: string;
  appleHideEmail: string;
  
  // Game Setup & Quiz View
  readyToPlay: string;
  prepMatchTitle: string;
  prepHowToPlay: string;
  prepQuestionsCount: string;
  prepTimePerQuestion: string;
  prepScoringSystem: string;
  prepComboBonus: string;
  prepAnswerTip: string;
  gameSummaryText: string;
  startQuiz: string;
  questionNumber: (current: number, total: number) => string;
  score: string;
  combo: string;
  timeRemaining: string;
  secondsShort: string;
  points: string;
  superCombo: string;
  timeoutMessage: string;
  
  // Feedback
  congratulations: string;
  almost: string;
  keepTrying: string;
  correctAnswerWas: string;
  msaExplanation: string;
  nextQuestion: string;
  viewResults: string;
  
  // Results Screen
  matchCompleted: string;
  finalScore: string;
  correctAnswers: string;
  incorrectAnswers: string;
  accuracy: string;
  highestCombo: string;
  totalTime: string;
  newRecord: string;
  playAgain: string;
  shareResult: string;
  returnToMenu: string;
  
  // Ranking
  rankingTitle: string;
  filterToday: string;
  filterWeek: string;
  filterMonth: string;
  filterAll: string;
  rankPosition: string;
  player: string;
  rankingPrivacyNote: string;
  emptyRanking: string;
  
  // Achievements
  achievementsTitle: string;
  unlockedCount: (unlocked: number, total: number) => string;
  achievementUnlocked: string;
  ach_first_correct_title: string;
  ach_first_correct_desc: string;
  ach_music_master_title: string;
  ach_music_master_desc: string;
  ach_streak_5_title: string;
  ach_streak_5_desc: string;
  ach_streak_10_title: string;
  ach_streak_10_desc: string;
  ach_clef_specialist_title: string;
  ach_clef_specialist_desc: string;
  ach_note_master_title: string;
  ach_note_master_desc: string;
  ach_great_apprentice_title: string;
  ach_great_apprentice_desc: string;
  ach_fermata_champ_title: string;
  ach_fermata_champ_desc: string;
  
  // How to Play
  howToPlayTitle: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  step6: string;
  step7: string;
  step8: string;
  msaPhase1Note: string;
  
  // Profile
  myProfile: string;
  editProfile: string;
  totalMatches: string;
  highestScore: string;
  totalCorrect: string;
  favoriteAvatar: string;
  changeAvatar: string;
  saveChanges: string;
  
  // Settings
  settingsTitle: string;
  languageSelect: string;
  themeSelect: string;
  themeDefault: string;
  themeDefaultDesc: string;
  themeBlack: string;
  themeBlackDesc: string;
  themeDarkBlue: string;
  themeDarkBlueDesc: string;
  themeMossGreen: string;
  themeMossGreenDesc: string;
  chooseClefTitle: string;
  clefSolTitle: string;
  clefFaTitle: string;
  clefDoTitle: string;
  clefSolDesc: string;
  clefFaDesc: string;
  clefDoDesc: string;
  welcomeGreeting: (name: string) => string;
  welcomeSubtitle: string;
  notEnoughClefQuestions: (count: number) => string;
  soundEffects: string;
  backgroundMusic: string;
  volume: string;
  on: string;
  off: string;
  accountSecurity: string;
  childProtectionNote: string;
  devicePreview: string;

  // Score Trophies & Medals
  totalAccumulatedScore: string;
  scoreTrophyTitle: string;
  bronzeMedalTitle: string;
  silverMedalTitle: string;
  goldTrophyTitle: string;
  goldTrophyCount: (count: number) => string;
  ptsToNextTrophy: (points: number, name: string) => string;
  
  // Share Card
  shareCardTitle: string;
  iPlayedFermataQuiz: string;
  shareCopySuccess: string;
  shareViaSystem: string;
  copySummary: string;
  
  // Avatars tabs
  animalsTab: string;
  biblicalTab: string;
  
  // Categories
  cat_musica_e_som: string;
  cat_elementos_da_musica: string;
  cat_propriedades_do_som: string;
  cat_notas_musicais: string;
  cat_pentagrama_e_pauta: string;
  cat_claves: string;

  // Developer Area & Online Status
  developerArea: string;
  developerDashboard: string;
  users: string;
  registeredUsers: string;
  onlineUsers: string;
  online: string;
  offline: string;
  all: string;
  search: string;
  searchByName: string;
  filters: string;
  lastActivity: string;
  totalUsers: string;
  totalOnline: string;
  totalOffline: string;
  matchesPlayed: string;
  registrationDate: string;
  summary: string;
  adminDeveloper: string;
  accessRestricted: string;
  youAreOnline: string;
  noOtherUsersOnline: string;
  seeOnlineMusicians: string;
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  'pt-BR': {
    appName: 'MusicalMente',
    slogan: 'Aprenda. Responda. Supere seu recorde.',
    tagline: 'Quiz Musical Educativo — Fase 1 do MSA',
    
    play: 'JOGAR',
    ranking: 'RANKING',
    profile: 'MEU PERFIL',
    achievements: 'CONQUISTAS',
    howToPlay: 'COMO JOGAR',
    settings: 'CONFIGURAÇÕES',
    back: 'Voltar',
    close: 'Fechar',
    save: 'Salvar',
    cancel: 'Cancelar',
    continue: 'Continuar',
    logout: 'Sair da Conta',
    guestMode: 'Entrar como Visitante',
    
    loginTitle: 'ENTRAR NO MusicalMente',
    loginSubtitle: 'Seu mundo musical 3D divertido e educativo!',
    loginQuizBadge: 'Quiz Musical Educativo - MSA Fase 1',
    continueWithGoogle: 'Continuar com Google',
    continueWithApple: 'Continuar com Apple',
    continueWithEmail: 'Continuar com E-mail',
    createAccount: 'Criar uma conta',
    alreadyHaveAccount: 'Já tenho uma conta',
    forgotPassword: 'Esqueci minha senha',
    nameOrNickname: 'Nome ou apelido',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar senha',
    preferredLanguage: 'Idioma preferido',
    chooseAvatar: 'Escolha seu Avatar 3D',
    resetPasswordInstructions: 'Digite seu e-mail cadastrado para enviarmos as instruções de redefinição.',
    sendResetLink: 'Enviar instruções',
    resetLinkSent: 'Instruções enviadas com sucesso!',
    emailSentSuccess: 'E-mail enviado com sucesso! Verifique sua caixa de entrada e clique no link para redefinir sua senha.',
    emailNotRegistered: 'Este e-mail não está cadastrado. Verifique a digitação ou crie uma conta.',
    invalidEmailAddress: 'Endereço de e-mail inválido. Por favor, digite um e-mail válido.',
    errorSendingEmail: 'Ocorreu um erro ao enviar o e-mail de redefinição. Tente novamente mais tarde.',
    linkExpiredOrInvalid: 'Link expirado ou inválido. Solicite uma nova redefinição de senha.',
    newPasswordTitle: 'Criar Nova Senha',
    saveNewPassword: 'Salvar Nova Senha',
    newPasswordSaved: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.',
    requestNewLink: 'Solicitar Novo Link',
    backToLogin: 'Voltar para o Login',
    passwordsMustMatch: 'As senhas devem ser idênticas.',
    fillAllFields: 'Por favor, preencha todos os campos.',
    privacyNotice: 'Ambiente seguro para crianças e jovens. Nenhuma informação pessoal ou e-mail é exibida publicamente.',
    appleHideEmail: 'Ocultar meu e-mail (@privaterelay)',
    
    readyToPlay: 'Preparado para o Quiz?',
    prepMatchTitle: 'Instruções da Partida',
    prepHowToPlay: 'Como Jogar',
    prepQuestionsCount: '20 Perguntas Exclusivas (MSA Fase 1)',
    prepTimePerQuestion: '30 Segundos por Pergunta',
    prepScoringSystem: 'Pontuação por Acerto + Bônus de Rapidez',
    prepComboBonus: 'Combo Multiplicador de Pontos',
    prepAnswerTip: 'Selecione uma das 4 alternativas antes do tempo esgotar',
    gameSummaryText: 'Você responderá a 20 perguntas da Fase 1 do MSA. Cada pergunta tem 30 segundos. Quanto mais rápido e assertivo, maior seu combo!',
    startQuiz: 'COMEÇAR PARTIDA',
    questionNumber: (current, total) => `Questão ${current} de ${total}`,
    score: 'Pontos',
    combo: 'Combo',
    timeRemaining: 'Tempo',
    secondsShort: 's',
    points: 'pts',
    superCombo: 'SUPER COMBO!',
    timeoutMessage: 'Tempo esgotado!',
    
    congratulations: 'PARABÉNS!',
    almost: 'QUASE!',
    keepTrying: 'Continue tentando! Você vai conseguir!',
    correctAnswerWas: 'Resposta correta:',
    msaExplanation: 'Explicação (MSA Fase 1):',
    nextQuestion: 'PRÓXIMA PERGUNTA',
    viewResults: 'VER RESULTADOS',
    
    matchCompleted: 'PARTIDA CONCLUÍDA!',
    finalScore: 'Pontuação Final',
    correctAnswers: 'Acertos',
    incorrectAnswers: 'Erros',
    accuracy: 'Aproveitamento',
    highestCombo: 'Maior Sequência',
    totalTime: 'Tempo de Jogo',
    newRecord: 'NOVO RECORDE PESSOAL!',
    playAgain: 'JOGAR NOVAMENTE',
    shareResult: 'COMPARTILHAR',
    returnToMenu: 'MENU PRINCIPAL',
    
    rankingTitle: 'MURAL DOS CAMPEÕES',
    filterToday: 'HOJE',
    filterWeek: 'SEMANA',
    filterMonth: 'MÊS',
    filterAll: 'GERAL',
    rankPosition: 'Pos.',
    player: 'Músico',
    rankingPrivacyNote: 'O ranking público exibe apenas avatar, apelido e pontuação.',
    emptyRanking: 'Nenhum resultado registrado ainda.',
    
    achievementsTitle: 'GALERIA DE TROFÉUS',
    unlockedCount: (unlocked, total) => `${unlocked} de ${total} Conquistados`,
    achievementUnlocked: 'Nova Conquista Desbloqueada!',
    ach_first_correct_title: 'Primeiro Acerto',
    ach_first_correct_desc: 'Acertou sua primeira pergunta na Fase 1 do MSA!',
    ach_music_master_title: 'Mestre da Música',
    ach_music_master_desc: 'Concluiu 5 partidas completas de quiz.',
    ach_streak_5_title: '5 Acertos Seguidos',
    ach_streak_5_desc: 'Alcançou um combo com 5 respostas corretas consecutivas.',
    ach_streak_10_title: '10 Acertos Seguidos',
    ach_streak_10_desc: 'Incrível! 10 acertos seguidos sem errar!',
    ach_clef_specialist_title: 'Especialista em Claves',
    ach_clef_specialist_desc: 'Acertou com perfeição todas as questões sobre Claves.',
    ach_note_master_title: 'Mestre das Notas',
    ach_note_master_desc: 'Acertou 15 ou mais perguntas em uma única partida.',
    ach_great_apprentice_title: 'Grande Aprendiz',
    ach_great_apprentice_desc: 'Alcançou mais de 2.000 pontos em uma partida.',
    ach_fermata_champ_title: 'Campeão do MusicalMente',
    ach_fermata_champ_desc: 'Partida perfeita! Acertou 20 de 20 perguntas!',
    
    howToPlayTitle: 'COMO JOGAR',
    step1: '1️⃣ Escolha seu personagem favorito (animais músicos ou heróis bíblicos).',
    step2: '2️⃣ Clique no botão principal JOGAR.',
    step3: '3️⃣ Responda a 20 perguntas sorteadas exclusivamente da Fase 1 do MSA.',
    step4: '4️⃣ Cada pergunta possui 30 segundos. Quanto mais rápido responder, mais bônus de agilidade você ganha!',
    step5: '5️⃣ Mantenha o foco para criar COMBOS de acertos seguidos e multiplicar sua pontuação.',
    step6: '6️⃣ Conquiste medalhas e troféus 3D exclusivos.',
    step7: '7️⃣ Entre no ranking dos melhores alunos da música.',
    step8: '8️⃣ Compartilhe sua vitória com seus pais, professores e amigos!',
    msaPhase1Note: 'Todo o conteúdo do MusicalMente é fundamentado estritamente na Fase 1 do Método Simplificado de Aprendizagem Musical (MSA).',
    
    myProfile: 'Meu Perfil',
    editProfile: 'Editar Perfil',
    totalMatches: 'Partidas Jogadas',
    highestScore: 'Recorde Máximo',
    totalCorrect: 'Total de Acertos',
    favoriteAvatar: 'Personagem Atual',
    changeAvatar: 'Trocar Personagem',
    saveChanges: 'Salvar Alterações',
    
    settingsTitle: 'Configurações',
    languageSelect: 'Idioma do Aplicativo',
    themeSelect: 'Cor de Fundo da Tela',
    themeDefault: 'Azul (Padrão)',
    themeDefaultDesc: 'Tema azul musical padrão',
    themeBlack: 'Preto',
    themeBlackDesc: 'Fundo escuro profundo',
    themeDarkBlue: 'Azul escuro',
    themeDarkBlueDesc: 'Tonalidade azul elegante',
    themeMossGreen: 'Verde musgo',
    themeMossGreenDesc: 'Tonalidade verde musgo suave',
    chooseClefTitle: 'ESCOLHA A CLAVE',
    clefSolTitle: 'CLAVE DE SOL',
    clefFaTitle: 'CLAVE DE FÁ',
    clefDoTitle: 'CLAVE DE DÓ',
    clefSolDesc: 'Perguntas e notas da Clave de Sol',
    clefFaDesc: 'Perguntas e notas da Clave de Fá',
    clefDoDesc: 'Perguntas e notas da Clave de Dó',
    welcomeGreeting: (name: string) => `Olá, ${name}!`,
    welcomeSubtitle: 'Seja bem-vindo ao Quiz Musical!',
    notEnoughClefQuestions: (count: number) => `Esta clave possui ${count} perguntas disponíveis. A partida iniciará com as perguntas cadastradas desta clave.`,
    soundEffects: 'Efeitos Sonoros',
    backgroundMusic: 'Música de Fundo',
    volume: 'Volume Geral',
    on: 'LIGADO',
    off: 'DESLIGADO',
    accountSecurity: 'Conta e Segurança',
    childProtectionNote: 'Design seguro para crianças. Seus dados privados estão protegidos.',
    devicePreview: 'Modo de Visualização Mobile',
    
    totalAccumulatedScore: 'Pontuação Total',
    scoreTrophyTitle: 'Conquistas por Pontos',
    bronzeMedalTitle: 'Medalha de Bronze',
    silverMedalTitle: 'Medalha de Prata',
    goldTrophyTitle: 'Troféu de Ouro',
    goldTrophyCount: (count: number) => count === 1 ? '1 Troféu de Ouro' : `${count} Troféus de Ouro`,
    ptsToNextTrophy: (points: number, name: string) => `Faltam ${points.toLocaleString()} pts para ${name}`,
    
    shareCardTitle: 'Cartão de Resultado',
    iPlayedFermataQuiz: 'Eu joguei MusicalMente!',
    shareCopySuccess: 'Texto copiado para a área de transferência!',
    shareViaSystem: 'Compartilhar no Celular',
    copySummary: 'Copiar Resultado',
    
    animalsTab: 'Animais Músicos 3D',
    biblicalTab: 'Personagens Bíblicos 3D',
    
    cat_musica_e_som: 'Música e Som',
    cat_elementos_da_musica: 'Elementos da Música',
    cat_propriedades_do_som: 'Propriedades do Som',
    cat_notas_musicais: 'Notas Musicais',
    cat_pentagrama_e_pauta: 'Pentagrama e Pauta',
    cat_claves: 'Claves Musicais',

    // Developer Area & Online Status
    developerArea: 'ÁREA DO DESENVOLVEDOR',
    developerDashboard: 'PAINEL DO DESENVOLVEDOR',
    users: 'Usuários',
    registeredUsers: 'USUÁRIOS CADASTRADOS',
    onlineUsers: 'USUÁRIOS ONLINE',
    online: 'Online',
    offline: 'Offline',
    all: 'Todos',
    search: 'Buscar',
    searchByName: 'Buscar por nome ou apelido...',
    filters: 'Filtros',
    lastActivity: 'Última Atividade',
    totalUsers: 'Total de Usuários',
    totalOnline: 'Total Online',
    totalOffline: 'Total Offline',
    matchesPlayed: 'Partidas Realizadas',
    registrationDate: 'Data de Cadastro',
    summary: 'RESUMO',
    adminDeveloper: 'ADMINISTRADOR + DESENVOLVEDOR',
    accessRestricted: 'Acesso Restrito: Apenas fabilhano@gmail.com possui acesso a este painel administrativo.',
    youAreOnline: 'Você está online!',
    noOtherUsersOnline: 'No momento, não há outros usuários online.',
    seeOnlineMusicians: 'Músicos Online Agora',
  },

  'fr-CA': {
    appName: 'MusicalMente',
    slogan: 'Apprends. Réponds. Dépasse ton record.',
    tagline: 'Quiz Musical Éducatif — Phase 1 du MSA',
    
    play: 'JOUER',
    ranking: 'CLASSEMENT',
    profile: 'MON PROFIL',
    achievements: 'SUCCÈS',
    howToPlay: 'COMMENT JOUER',
    settings: 'PARAMÈTRES',
    back: 'Retour',
    close: 'Fermer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    continue: 'Continuer',
    logout: 'Déconnexion',
    guestMode: 'Entrer comme invité',
    
    loginTitle: 'ENTRER DANS MusicalMente',
    loginSubtitle: 'Ton monde musical 3D amusant et éducatif!',
    loginQuizBadge: 'Quiz Musical Éducatif - MSA Phase 1',
    continueWithGoogle: 'Continuer avec Google',
    continueWithApple: 'Continuer avec Apple',
    continueWithEmail: 'Continuer avec courriel',
    createAccount: 'Créer un compte',
    alreadyHaveAccount: 'J’ai déjà un compte',
    forgotPassword: 'Mot de passe oublié?',
    nameOrNickname: 'Nom ou surnom',
    email: 'Courriel',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    preferredLanguage: 'Langue préférée',
    chooseAvatar: 'Choisis ton avatar 3D',
    resetPasswordInstructions: 'Saisis ton courriel pour recevoir les instructions de réinitialisation.',
    sendResetLink: 'Envoyer les instructions',
    resetLinkSent: 'Instructions envoyées avec succès!',
    emailSentSuccess: 'Courriel envoyé avec succès! Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.',
    emailNotRegistered: 'Cette adresse courriel n’est pas enregistrée. Vérifiez la saisie ou créez un compte.',
    invalidEmailAddress: 'Adresse courriel invalide. Veuillez entrer une adresse valide.',
    errorSendingEmail: 'Une erreur s’est produite lors de l’envoi du courriel. Veuillez réessayer plus tard.',
    linkExpiredOrInvalid: 'Lien expiré ou invalide. Veuillez demander une nouvelle réinitialisation de mot de passe.',
    newPasswordTitle: 'Créer un nouveau mot de passe',
    saveNewPassword: 'Enregistrer le nouveau mot de passe',
    newPasswordSaved: 'Mot de passe réinitialisé avec succès! Vous pouvez maintenant vous connecter.',
    requestNewLink: 'Demander un nouveau lien',
    backToLogin: 'Retour à la connexion',
    passwordsMustMatch: 'Les mots de passe doivent être identiques.',
    fillAllFields: 'Veuillez remplir tous les champs.',
    privacyNotice: 'Environnement sécuritaire pour enfants et ados. Aucune information personnelle ou courriel n’est affiché publiquement.',
    appleHideEmail: 'Masquer mon courriel (@privaterelay)',
    
    readyToPlay: 'Prêt pour le quiz?',
    prepMatchTitle: 'Instructions de la partie',
    prepHowToPlay: 'Comment jouer',
    prepQuestionsCount: '20 questions exclusives (Phase 1 du MSA)',
    prepTimePerQuestion: '30 secondes par question',
    prepScoringSystem: 'Points par réussite + Bonus de rapidité',
    prepComboBonus: 'Combo multiplicateur de points',
    prepAnswerTip: 'Sélectionne l’une des 4 options avant la fin du chronomètre',
    gameSummaryText: 'Tu répondras à 20 questions de la Phase 1 du MSA. Chaque question dure 30 secondes. Plus tu réponds vite et juste, plus grand sera ton combo!',
    startQuiz: 'DÉBUTER LA PARTIE',
    questionNumber: (current, total) => `Question ${current} sur ${total}`,
    score: 'Points',
    combo: 'Combo',
    timeRemaining: 'Temps',
    secondsShort: 's',
    points: 'pts',
    superCombo: 'SUPER COMBO!',
    timeoutMessage: 'Temps écoulé!',
    
    congratulations: 'FÉLICITATIONS!',
    almost: 'PRESQUE!',
    keepTrying: 'Continue tes efforts! Tu es capable!',
    correctAnswerWas: 'Bonne réponse :',
    msaExplanation: 'Explication (MSA Phase 1) :',
    nextQuestion: 'QUESTION SUIVANTE',
    viewResults: 'VOIR LES RÉSULTATS',
    
    matchCompleted: 'PARTIE TERMINÉE!',
    finalScore: 'Score final',
    correctAnswers: 'Bonnes réponses',
    incorrectAnswers: 'Erreurs',
    accuracy: 'Précision',
    highestCombo: 'Meilleure suite',
    totalTime: 'Temps total',
    newRecord: 'NOUVEAU RECORD PERSONNEL!',
    playAgain: 'REJOUER',
    shareResult: 'PARTAGER',
    returnToMenu: 'MENU PRINCIPAL',
    
    rankingTitle: 'TABLEAU D’HONNEUR',
    filterToday: 'AUJOURD’HUI',
    filterWeek: 'SEMAINE',
    filterMonth: 'MOIS',
    filterAll: 'GÉNÉRAL',
    rankPosition: 'Pos.',
    player: 'Musicien',
    rankingPrivacyNote: 'Le classement public n’affiche que l’avatar, le surnom et le pointage.',
    emptyRanking: 'Aucun résultat enregistré pour l’instant.',
    
    achievementsTitle: 'GALERIE DES TROPHÉES',
    unlockedCount: (unlocked, total) => `${unlocked} sur ${total} obtenus`,
    achievementUnlocked: 'Nouveau trophée débloqué!',
    ach_first_correct_title: 'Première victoire',
    ach_first_correct_desc: 'Bonne réponse à ta première question du MSA Phase 1!',
    ach_music_master_title: 'Maître de la musique',
    ach_music_master_desc: 'Complété 5 parties entières de quiz.',
    ach_streak_5_title: '5 réponses d’affilée',
    ach_streak_5_desc: 'Enchaîné 5 bonnes réponses consécutives.',
    ach_streak_10_title: '10 réponses d’affilée',
    ach_streak_10_desc: 'Incroyable! 10 réponses sans la moindre erreur!',
    ach_clef_specialist_title: 'Spécialiste des clefs',
    ach_clef_specialist_desc: 'Toutes les questions sur les clefs réussies parfaitement.',
    ach_note_master_title: 'Maître des notes',
    ach_note_master_desc: '15 bonnes réponses ou plus dans une seule partie.',
    ach_great_apprentice_title: 'Grand apprenti',
    ach_great_apprentice_desc: 'Plus de 2 000 points atteints dans une partie.',
    ach_fermata_champ_title: 'Champion MusicalMente',
    ach_fermata_champ_desc: 'Partie parfaite! 20 sur 20 questions réussies!',
    
    howToPlayTitle: 'COMMENT JOUER',
    step1: '1️⃣ Choisis ton personnage 3D préféré (animaux musiciens ou personnages bibliques).',
    step2: '2️⃣ Clique sur le gros bouton JOUER.',
    step3: '3️⃣ Réponds à 20 questions tirées exclusivement de la Phase 1 du MSA.',
    step4: '4️⃣ Tu disposes de 30 secondes par question. Plus tu réponds rapidement, plus de points bonus tu obtiens!',
    step5: '5️⃣ Garde ta concentration pour réussir des COMBOS et multiplier tes points.',
    step6: '6️⃣ Débloque des médailles et des trophées 3D éclatants.',
    step7: '7️⃣ Grimpe dans le classement des meilleurs jeunes musiciens.',
    step8: '8️⃣ Partage ton résultat avec tes parents, ton professeur et tes amis!',
    msaPhase1Note: 'Tout le contenu de MusicalMente provient rigoureusement de la Phase 1 de la Méthode Simplifiée d’Apprentissage Musical (MSA).',
    
    myProfile: 'Mon profil',
    editProfile: 'Modifier le profil',
    totalMatches: 'Parties jouées',
    highestScore: 'Record maximal',
    totalCorrect: 'Total de réussites',
    favoriteAvatar: 'Personnage actuel',
    changeAvatar: 'Changer de personnage',
    saveChanges: 'Sauvegarder',
    
    settingsTitle: 'Paramètres',
    languageSelect: 'Langue de l’application',
    themeSelect: 'Couleur de fond',
    themeDefault: 'Bleu (Défaut)',
    themeDefaultDesc: 'Thème bleu musical par défaut',
    themeBlack: 'Noir',
    themeBlackDesc: 'Fond sombre profond',
    themeDarkBlue: 'Bleu nuit',
    themeDarkBlueDesc: 'Nuance bleue élégante',
    themeMossGreen: 'Vert mousse',
    themeMossGreenDesc: 'Nuance vert mousse naturelle',
    chooseClefTitle: 'CHOISISSEZ LA CLEF',
    clefSolTitle: 'CLEF DE SOL',
    clefFaTitle: 'CLEF DE FA',
    clefDoTitle: 'CLEF D’UT (DO)',
    clefSolDesc: 'Questions et notes en Clef de Sol',
    clefFaDesc: 'Questions et notes en Clef de Fa',
    clefDoDesc: 'Questions et notes en Clef d’Ut',
    welcomeGreeting: (name: string) => `Bonjour, ${name}!`,
    welcomeSubtitle: 'Bienvenue au Quiz Musical!',
    notEnoughClefQuestions: (count: number) => `Cette clef contient ${count} questions disponibles. Le quiz démarrera avec les questions de cette clef.`,
    soundEffects: 'Effets sonores',
    backgroundMusic: 'Musique de fond',
    volume: 'Volume général',
    on: 'ACTIVÉ',
    off: 'DÉSACTIVÉ',
    accountSecurity: 'Compte et sécurité',
    childProtectionNote: 'Conception sécuritaire pour enfants. Tes données privées sont protégées.',
    devicePreview: 'Aperçu mobile',
    
    totalAccumulatedScore: 'Score total',
    scoreTrophyTitle: 'Succès par points',
    bronzeMedalTitle: 'Médaille de bronze',
    silverMedalTitle: 'Médaille d’argent',
    goldTrophyTitle: 'Trophée d’or',
    goldTrophyCount: (count: number) => count === 1 ? '1 Trophée d’or' : `${count} Trophées d’or`,
    ptsToNextTrophy: (points: number, name: string) => `Encore ${points.toLocaleString()} pts pour ${name}`,
    
    shareCardTitle: 'Fiche de résultat',
    iPlayedFermataQuiz: 'J’ai joué à MusicalMente!',
    shareCopySuccess: 'Texte copié dans le presse-papiers!',
    shareViaSystem: 'Partager sur mobile',
    copySummary: 'Copier le résumé',
    
    animalsTab: 'Animaux musiciens 3D',
    biblicalTab: 'Personnages bibliques 3D',
    
    cat_musica_e_som: 'Musique et son',
    cat_elementos_da_musica: 'Éléments de la musique',
    cat_propriedades_do_som: 'Propriétés du son',
    cat_notas_musicais: 'Notes de musique',
    cat_pentagrama_e_pauta: 'Portée musicale',
    cat_claves: 'Clefs musicales',

    // Developer Area & Online Status
    developerArea: 'ZONE DÉVELOPPEUR',
    developerDashboard: 'PANNEAU DÉVELOPPEUR',
    users: 'Utilisateurs',
    registeredUsers: 'UTILISATEURS ENREGISTRÉS',
    onlineUsers: 'UTILISATEURS EN LIGNE',
    online: 'En ligne',
    offline: 'Hors ligne',
    all: 'Tous',
    search: 'Rechercher',
    searchByName: 'Rechercher par nom ou pseudo...',
    filters: 'Filtres',
    lastActivity: 'Dernière Activité',
    totalUsers: 'Total des Utilisateurs',
    totalOnline: 'Total en Ligne',
    totalOffline: 'Total Hors Ligne',
    matchesPlayed: 'Parties Réalisées',
    registrationDate: 'Date d’inscription',
    summary: 'RÉSUMÉ',
    adminDeveloper: 'ADMINISTRATEUR + DÉVELOPPEUR',
    accessRestricted: 'Accès Restreint: Seul fabilhano@gmail.com a accès à ce panneau d’administration.',
    youAreOnline: 'Tu es en ligne!',
    noOtherUsersOnline: 'Pour le moment, aucun autre utilisateur n’est en ligne.',
    seeOnlineMusicians: 'Musiciens en ligne actuellement',
  },

  'en-CA': {
    appName: 'MusicalMente',
    slogan: 'Learn. Answer. Beat your record.',
    tagline: 'Educational Musical Quiz — MSA Phase 1',
    
    play: 'PLAY',
    ranking: 'LEADERBOARD',
    profile: 'MY PROFILE',
    achievements: 'ACHIEVEMENTS',
    howToPlay: 'HOW TO PLAY',
    settings: 'SETTINGS',
    back: 'Back',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    logout: 'Log Out',
    guestMode: 'Play as Guest',
    
    loginTitle: 'ENTER MusicalMente',
    loginSubtitle: 'Your fun, educational 3D musical universe!',
    loginQuizBadge: 'Educational Musical Quiz - MSA Phase 1',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    continueWithEmail: 'Continue with Email',
    createAccount: 'Create an account',
    alreadyHaveAccount: 'I already have an account',
    forgotPassword: 'Forgot password?',
    nameOrNickname: 'Name or nickname',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    preferredLanguage: 'Preferred language',
    chooseAvatar: 'Choose your 3D Avatar',
    resetPasswordInstructions: 'Enter your email to receive password reset instructions.',
    sendResetLink: 'Send instructions',
    resetLinkSent: 'Instructions sent successfully!',
    emailSentSuccess: 'Email sent successfully! Check your inbox and click the link to reset your password.',
    emailNotRegistered: 'This email is not registered. Please check the spelling or create an account.',
    invalidEmailAddress: 'Invalid email address. Please enter a valid email.',
    errorSendingEmail: 'An error occurred while sending the reset email. Please try again later.',
    linkExpiredOrInvalid: 'Expired or invalid link. Please request a new password reset.',
    newPasswordTitle: 'Create New Password',
    saveNewPassword: 'Save New Password',
    newPasswordSaved: 'Password reset successfully! You can now log in with your new password.',
    requestNewLink: 'Request New Link',
    backToLogin: 'Back to Login',
    passwordsMustMatch: 'Passwords must match.',
    fillAllFields: 'Please fill in all fields.',
    privacyNotice: 'Kid & teen-safe environment. No personal info or emails are ever shown publicly.',
    appleHideEmail: 'Hide my email (@privaterelay)',
    
    readyToPlay: 'Ready for the Quiz?',
    prepMatchTitle: 'Match Instructions',
    prepHowToPlay: 'How to Play',
    prepQuestionsCount: '20 Exclusive Questions (MSA Phase 1)',
    prepTimePerQuestion: '30 Seconds per Question',
    prepScoringSystem: 'Points per Correct Answer + Speed Bonus',
    prepComboBonus: 'Score Multiplier Combo',
    prepAnswerTip: 'Select one of the 4 choices before time runs out',
    gameSummaryText: 'You will answer 20 questions strictly from MSA Phase 1. Each question gives you 30 seconds. The faster and more accurate you are, the higher your combo!',
    startQuiz: 'START MATCH',
    questionNumber: (current, total) => `Question ${current} of ${total}`,
    score: 'Points',
    combo: 'Combo',
    timeRemaining: 'Time',
    secondsShort: 's',
    points: 'pts',
    superCombo: 'SUPER COMBO!',
    timeoutMessage: 'Time is up!',
    
    congratulations: 'CONGRATULATIONS!',
    almost: 'ALMOST!',
    keepTrying: 'Keep trying! You can do it!',
    correctAnswerWas: 'Correct answer was:',
    msaExplanation: 'Explanation (MSA Phase 1):',
    nextQuestion: 'NEXT QUESTION',
    viewResults: 'VIEW RESULTS',
    
    matchCompleted: 'MATCH COMPLETED!',
    finalScore: 'Final Score',
    correctAnswers: 'Correct',
    incorrectAnswers: 'Mistakes',
    accuracy: 'Accuracy',
    highestCombo: 'Highest Streak',
    totalTime: 'Total Time',
    newRecord: 'NEW PERSONAL RECORD!',
    playAgain: 'PLAY AGAIN',
    shareResult: 'SHARE RESULT',
    returnToMenu: 'MAIN MENU',
    
    rankingTitle: 'HALL OF FAME',
    filterToday: 'TODAY',
    filterWeek: 'WEEK',
    filterMonth: 'MONTH',
    filterAll: 'ALL TIME',
    rankPosition: 'Rank',
    player: 'Musician',
    rankingPrivacyNote: 'The public leaderboard only displays avatar, nickname, and score.',
    emptyRanking: 'No records registered yet.',
    
    achievementsTitle: 'TROPHY ROOM',
    unlockedCount: (unlocked, total) => `${unlocked} of ${total} Unlocked`,
    achievementUnlocked: 'New Achievement Unlocked!',
    ach_first_correct_title: 'First Note Right',
    ach_first_correct_desc: 'Answered your first MSA Phase 1 question correctly!',
    ach_music_master_title: 'Music Master',
    ach_music_master_desc: 'Completed 5 full quiz matches.',
    ach_streak_5_title: '5 in a Row',
    ach_streak_5_desc: 'Reached a streak combo of 5 consecutive correct answers.',
    ach_streak_10_title: '10 in a Row',
    ach_streak_10_desc: 'Incredible! 10 correct answers with zero mistakes!',
    ach_clef_specialist_title: 'Clef Specialist',
    ach_clef_specialist_desc: 'Answered all musical clef questions with 100% accuracy.',
    ach_note_master_title: 'Notes Virtuoso',
    ach_note_master_desc: 'Got 15 or more correct answers in a single match.',
    ach_great_apprentice_title: 'Star Apprentice',
    ach_great_apprentice_desc: 'Scored over 2,000 points in a single match.',
    ach_fermata_champ_title: 'MusicalMente Champion',
    ach_fermata_champ_desc: 'Flawless victory! 20 out of 20 correct answers!',
    
    howToPlayTitle: 'HOW TO PLAY',
    step1: '1️⃣ Choose your favorite 3D companion (animal musician or biblical hero).',
    step2: '2️⃣ Click the big PLAY button.',
    step3: '3️⃣ Answer 20 questions drawn exclusively from MSA Phase 1.',
    step4: '4️⃣ You have 30 seconds per question. Answering quickly awards speed bonus points!',
    step5: '5️⃣ Maintain your streak to trigger exciting COMBOS and multiply your score.',
    step6: '6️⃣ Earn radiant 3D badges and trophies.',
    step7: '7️⃣ Climb the young musicians leaderboard.',
    step8: '8️⃣ Share your awesome accomplishment with your parents, teacher, and friends!',
    msaPhase1Note: 'All question content in MusicalMente is strictly grounded in Phase 1 of the Simplified Musical Learning Method (MSA).',
    
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    totalMatches: 'Matches Played',
    highestScore: 'High Score',
    totalCorrect: 'Total Correct',
    favoriteAvatar: 'Current Companion',
    changeAvatar: 'Change Companion',
    saveChanges: 'Save Changes',
    
    settingsTitle: 'Settings',
    languageSelect: 'App Language',
    themeSelect: 'Screen Background Color',
    themeDefault: 'Blue (Default)',
    themeDefaultDesc: 'Vibrant musical blue default',
    themeBlack: 'Black',
    themeBlackDesc: 'Deep pitch black',
    themeDarkBlue: 'Midnight Navy',
    themeDarkBlueDesc: 'Elegant midnight navy',
    themeMossGreen: 'Moss Green',
    themeMossGreenDesc: 'Natural serene moss green',
    chooseClefTitle: 'CHOOSE THE CLEF',
    clefSolTitle: 'TREBLE CLEF (G)',
    clefFaTitle: 'BASS CLEF (F)',
    clefDoTitle: 'ALTO CLEF (C)',
    clefSolDesc: 'Treble Clef notes and staff questions',
    clefFaDesc: 'Bass Clef notes and staff questions',
    clefDoDesc: 'Alto Clef notes and staff questions',
    welcomeGreeting: (name: string) => `Hello, ${name}!`,
    welcomeSubtitle: 'Welcome to the Music Quiz!',
    notEnoughClefQuestions: (count: number) => `This clef has ${count} questions available. The match will start with the available questions for this clef.`,
    soundEffects: 'Sound Effects',
    backgroundMusic: 'Background Music',
    volume: 'Master Volume',
    on: 'ON',
    off: 'OFF',
    accountSecurity: 'Account & Security',
    childProtectionNote: 'Kid-friendly design. Your private data stays confidential.',
    devicePreview: 'Mobile Preview Frame',
    
    totalAccumulatedScore: 'Total Score',
    scoreTrophyTitle: 'Score Milestones',
    bronzeMedalTitle: 'Bronze Medal',
    silverMedalTitle: 'Silver Medal',
    goldTrophyTitle: 'Gold Trophy',
    goldTrophyCount: (count: number) => count === 1 ? '1 Gold Trophy' : `${count} Gold Trophies`,
    ptsToNextTrophy: (points: number, name: string) => `${points.toLocaleString()} pts left to ${name}`,
    
    shareCardTitle: 'Result Card',
    iPlayedFermataQuiz: 'I played MusicalMente!',
    shareCopySuccess: 'Copied to clipboard!',
    shareViaSystem: 'Share on Mobile',
    copySummary: 'Copy Summary',
    
    animalsTab: '3D Animal Musicians',
    biblicalTab: '3D Biblical Characters',
    
    cat_musica_e_som: 'Music and Sound',
    cat_elementos_da_musica: 'Elements of Music',
    cat_propriedades_do_som: 'Sound Properties',
    cat_notas_musicais: 'Musical Notes',
    cat_pentagrama_e_pauta: 'Musical Staff',
    cat_claves: 'Musical Clefs',

    // Developer Area & Online Status
    developerArea: 'DEVELOPER AREA',
    developerDashboard: 'DEVELOPER DASHBOARD',
    users: 'Users',
    registeredUsers: 'REGISTERED USERS',
    onlineUsers: 'ONLINE USERS',
    online: 'Online',
    offline: 'Offline',
    all: 'All',
    search: 'Search',
    searchByName: 'Search by name or nickname...',
    filters: 'Filters',
    lastActivity: 'Last Activity',
    totalUsers: 'Total Users',
    totalOnline: 'Total Online',
    totalOffline: 'Total Offline',
    matchesPlayed: 'Matches Played',
    registrationDate: 'Registration Date',
    summary: 'SUMMARY',
    adminDeveloper: 'ADMINISTRATOR + DEVELOPER',
    accessRestricted: 'Restricted Access: Only fabilhano@gmail.com has access to this administrator panel.',
    youAreOnline: 'You are online!',
    noOtherUsersOnline: 'No other users are currently online.',
    seeOnlineMusicians: 'Musicians Online Now',
  },
};
