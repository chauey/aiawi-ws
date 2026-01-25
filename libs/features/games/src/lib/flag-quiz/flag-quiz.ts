import { Component, OnInit, OnDestroy, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucidePlay,
  lucideBookOpen,
  lucideSettings,
  lucideTrophy,
  lucideTimer,
  lucideCheck,
  lucideX,
  lucideEye,
  lucideEyeOff,
  lucideRotateCcw,
  lucideChevronLeft,
  lucideChevronRight,
  lucideBarChart3,
  lucideStar,
  lucideFilter
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { COUNTRIES, Country, CONTINENTS, getFlagUrl } from './flags-data';

type GameMode = 'menu' | 'quiz' | 'training' | 'results' | 'stats';
type Difficulty = 'easy' | 'medium' | 'hard' | 'all';
type Speed = 10 | 5 | 3;

interface QuizState {
  currentQuestion: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: { country: Country; correct: boolean; timeTaken: number }[];
  timeLeft: number;
  selectedAnswer: Country | null;
  showResult: boolean;
}

interface GameSettings {
  difficulty: Difficulty;
  speed: Speed;
  questionCount: number;
}

interface SavedData {
  knownFlags: string[]; // country codes
  hiddenFlags: string[]; // country codes to hide
  highScores: { difficulty: Difficulty; speed: Speed; score: number; date: string }[];
  gamesPlayed: number;
  totalCorrect: number;
  totalQuestions: number;
}

@Component({
  selector: 'lib-flag-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgIconComponent,
    HlmButton,
    ...HlmCardImports,
    HlmBadge
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucidePlay,
      lucideBookOpen,
      lucideSettings,
      lucideTrophy,
      lucideTimer,
      lucideCheck,
      lucideX,
      lucideEye,
      lucideEyeOff,
      lucideRotateCcw,
      lucideChevronLeft,
      lucideChevronRight,
      lucideBarChart3,
      lucideStar,
      lucideFilter
    })
  ],
  templateUrl: './flag-quiz.html',
  styleUrl: './flag-quiz.scss'
})
export class FlagQuiz implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Game state
  mode = signal<GameMode>('menu');
  settings = signal<GameSettings>({ difficulty: 'easy', speed: 10, questionCount: 20 });
  
  // Quiz state
  quizState = signal<QuizState>({
    currentQuestion: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answers: [],
    timeLeft: 10,
    selectedAnswer: null,
    showResult: false
  });
  
  // Current quiz data
  quizQuestions = signal<Country[]>([]);
  currentOptions = signal<Country[]>([]);
  
  // Training state
  trainingIndex = signal(0);
  trainingFilter = signal<string>('All');
  showFlagInTraining = signal(true);
  
  // Saved data
  savedData = signal<SavedData>({
    knownFlags: [],
    hiddenFlags: [],
    highScores: [],
    gamesPlayed: 0,
    totalCorrect: 0,
    totalQuestions: 0
  });

  // Computed
  allCountries = COUNTRIES;
  continents = CONTINENTS;
  Math = Math; // For template usage
  getFlagUrl = getFlagUrl; // For template usage
  
  currentQuestion = computed(() => {
    const questions = this.quizQuestions();
    const state = this.quizState();
    return questions[state.currentQuestion] || null;
  });

  filteredTrainingCountries = computed(() => {
    const filter = this.trainingFilter();
    const hidden = this.savedData().hiddenFlags;
    let countries = filter === 'All' 
      ? this.allCountries 
      : this.allCountries.filter(c => c.continent === filter);
    return countries.filter(c => !hidden.includes(c.code));
  });

  currentTrainingCountry = computed(() => {
    const countries = this.filteredTrainingCountries();
    const index = this.trainingIndex();
    return countries[index] || null;
  });

  progress = computed(() => {
    const state = this.quizState();
    const total = this.settings().questionCount;
    return ((state.currentQuestion) / total) * 100;
  });

  accuracy = computed(() => {
    const data = this.savedData();
    if (data.totalQuestions === 0) return 0;
    return Math.round((data.totalCorrect / data.totalQuestions) * 100);
  });

  isKnown = computed(() => {
    const country = this.currentTrainingCountry();
    if (!country) return false;
    return this.savedData().knownFlags.includes(country.code);
  });

  ngOnInit() {
    this.loadSavedData();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  // Data persistence
  private loadSavedData() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('flag-quiz-data');
      if (saved) {
        try {
          this.savedData.set(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load saved data', e);
        }
      }
    }
  }

  private saveData() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('flag-quiz-data', JSON.stringify(this.savedData()));
    }
  }

  // Quiz functions
  startQuiz() {
    const settings = this.settings();
    const difficulty = settings.difficulty;
    
    // Filter countries by difficulty and exclude hidden
    let availableCountries = this.allCountries.filter(c => 
      !this.savedData().hiddenFlags.includes(c.code)
    );
    
    if (difficulty !== 'all') {
      const diffMap = { easy: 1, medium: 2, hard: 3 };
      availableCountries = availableCountries.filter(c => c.difficulty === diffMap[difficulty]);
    }
    
    // Shuffle and pick questions
    const shuffled = this.shuffleArray([...availableCountries]);
    const questions = shuffled.slice(0, Math.min(settings.questionCount, shuffled.length));
    
    this.quizQuestions.set(questions);
    this.quizState.set({
      currentQuestion: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      answers: [],
      timeLeft: settings.speed,
      selectedAnswer: null,
      showResult: false
    });
    
    this.generateOptions();
    this.mode.set('quiz');
    this.startTimer();
  }

  private generateOptions() {
    const current = this.currentQuestion();
    if (!current) return;
    
    // Get 9 wrong answers from same difficulty level if possible
    const wrongAnswers = this.allCountries
      .filter(c => c.code !== current.code)
      .sort(() => Math.random() - 0.5)
      .slice(0, 9);
    
    // Combine and sort alphabetically by country name
    const options = [current, ...wrongAnswers].sort((a, b) => a.name.localeCompare(b.name));
    this.currentOptions.set(options);
  }

  selectAnswer(country: Country) {
    if (this.quizState().showResult) return;
    
    this.stopTimer();
    const current = this.currentQuestion();
    const isCorrect = country.code === current?.code;
    const timeTaken = this.settings().speed - this.quizState().timeLeft;
    const currentStreak = this.quizState().streak;
    
    if (isCorrect) {
      this.triggerConfetti();
      this.showFloatingScore(currentStreak + 1);
      this.flashScreen('correct');
    } else {
      this.flashScreen('wrong');
    }
    
    this.quizState.update(state => ({
      ...state,
      selectedAnswer: country,
      showResult: true,
      score: isCorrect ? state.score + 1 : state.score,
      streak: isCorrect ? state.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(state.bestStreak, state.streak + 1) : state.bestStreak,
      answers: [...state.answers, { country: current!, correct: isCorrect, timeTaken }]
    }));
    
    // Auto-advance after delay
    setTimeout(() => this.nextQuestion(), 1500);
  }

  private showFloatingScore(streak: number) {
    // Create floating +1 and streak message
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:9998;text-align:center;';
    document.body.appendChild(container);

    // Big +1
    const plusOne = document.createElement('div');
    plusOne.textContent = '+1';
    plusOne.style.cssText = `
      font-size:5rem;font-weight:900;
      color:#22c55e;
      text-shadow:0 0 20px #22c55e, 0 0 40px #22c55e, 0 0 60px #22c55e;
      animation:score-pop 0.8s ease-out forwards;
    `;
    container.appendChild(plusOne);

    // Streak message for combos
    if (streak >= 2) {
      const streakMsg = document.createElement('div');
      let message = '';
      let color = '#fbbf24';
      
      if (streak >= 10) {
        message = '🔥 LEGENDARY! 🔥';
        color = '#ef4444';
      } else if (streak >= 7) {
        message = '⚡ UNSTOPPABLE! ⚡';
        color = '#a855f7';
      } else if (streak >= 5) {
        message = '🌟 ON FIRE! 🌟';
        color = '#f97316';
      } else if (streak >= 3) {
        message = '✨ AMAZING! ✨';
        color = '#eab308';
      } else {
        message = `🔥 ${streak} STREAK!`;
      }
      
      streakMsg.textContent = message;
      streakMsg.style.cssText = `
        font-size:2rem;font-weight:800;
        color:${color};
        text-shadow:0 0 10px ${color}, 0 0 20px ${color};
        margin-top:10px;
        animation:streak-bounce 0.6s ease-out forwards;
        animation-delay:0.2s;
        opacity:0;
      `;
      container.appendChild(streakMsg);
    }

    setTimeout(() => container.remove(), 1500);
  }

  private flashScreen(type: 'correct' | 'wrong') {
    const flash = document.createElement('div');
    const color = type === 'correct' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    flash.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:${color};
      pointer-events:none;z-index:9997;
      animation:screen-flash 0.3s ease-out forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  }

  skipQuestion() {
    if (this.quizState().showResult) return;
    
    this.stopTimer();
    const current = this.currentQuestion();
    
    this.quizState.update(state => ({
      ...state,
      showResult: true,
      streak: 0,
      answers: [...state.answers, { country: current!, correct: false, timeTaken: this.settings().speed }]
    }));
    
    setTimeout(() => this.nextQuestion(), 1500);
  }

  private triggerConfetti() {
    // Create epic confetti explosion!
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    // Vibrant rainbow colors
    const colors = [
      '#ff0000', '#ff4500', '#ff6b00', '#ffa500', // Reds & Oranges
      '#ffff00', '#7fff00', '#00ff00', '#00ff7f', // Yellows & Greens
      '#00ffff', '#00bfff', '#0080ff', '#0000ff', // Cyans & Blues
      '#8000ff', '#bf00ff', '#ff00ff', '#ff007f', // Purples & Magentas
      '#ffd700', '#ff69b4', '#00fa9a', '#ff1493', // Gold, Pink, etc
    ];

    // Shapes: circles, squares, rectangles, stars, hearts
    const shapes = ['circle', 'square', 'rectangle', 'star', 'heart', 'diamond'];

    // Create burst from center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Explosion particles (burst from center)
    for (let i = 0; i < 80; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = 8 + Math.random() * 12;
      const angle = (Math.PI * 2 * i) / 80 + Math.random() * 0.5;
      const velocity = 300 + Math.random() * 400;
      const endX = Math.cos(angle) * velocity;
      const endY = Math.sin(angle) * velocity;
      
      let shapeStyles = '';
      if (shape === 'circle') {
        shapeStyles = 'border-radius:50%;';
      } else if (shape === 'star') {
        shapeStyles = 'clip-path:polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);';
      } else if (shape === 'heart') {
        shapeStyles = 'clip-path:polygon(50% 15%, 90% 0%, 100% 35%, 50% 100%, 0% 35%, 10% 0%);';
      } else if (shape === 'diamond') {
        shapeStyles = 'clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);';
      } else if (shape === 'rectangle') {
        shapeStyles = `width:${size * 0.4}px;height:${size}px;`;
      }

      particle.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        background:${color};
        left:${centerX}px;top:${centerY}px;
        ${shapeStyles}
        box-shadow:0 0 ${size/2}px ${color};
        animation:confetti-burst 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        --endX:${endX}px;--endY:${endY}px;
        animation-delay:${Math.random() * 0.1}s;
      `;
      container.appendChild(particle);
    }

    // Falling confetti from top
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 10;
      const isRect = Math.random() > 0.5;
      
      confetti.style.cssText = `
        position:absolute;
        width:${isRect ? size * 0.4 : size}px;
        height:${size}px;
        background:${color};
        left:${Math.random() * 100}%;
        top:-20px;
        border-radius:${isRect ? '2px' : '50%'};
        box-shadow:0 0 ${size/3}px ${color}40;
        animation:confetti-fall ${2 + Math.random() * 2}s ease-out forwards;
        animation-delay:${Math.random() * 0.8}s;
      `;
      container.appendChild(confetti);
    }

    // Sparkles/glitter
    for (let i = 0; i < 40; i++) {
      const sparkle = document.createElement('div');
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight * 0.6;
      
      sparkle.style.cssText = `
        position:absolute;
        width:4px;height:4px;
        background:#fff;
        left:${x}px;top:${y}px;
        border-radius:50%;
        box-shadow:0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ffd700;
        animation:sparkle 0.8s ease-out forwards;
        animation-delay:${0.2 + Math.random() * 0.5}s;
        opacity:0;
      `;
      container.appendChild(sparkle);
    }

    setTimeout(() => container.remove(), 4000);
  }

  private nextQuestion() {
    const state = this.quizState();
    const settings = this.settings();
    
    if (state.currentQuestion + 1 >= settings.questionCount || 
        state.currentQuestion + 1 >= this.quizQuestions().length) {
      this.endQuiz();
      return;
    }
    
    this.quizState.update(s => ({
      ...s,
      currentQuestion: s.currentQuestion + 1,
      timeLeft: settings.speed,
      selectedAnswer: null,
      showResult: false
    }));
    
    this.generateOptions();
    this.startTimer();
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.quizState.update(state => {
        if (state.timeLeft <= 1) {
          this.handleTimeout();
          return { ...state, timeLeft: 0 };
        }
        return { ...state, timeLeft: state.timeLeft - 1 };
      });
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private handleTimeout() {
    this.stopTimer();
    const current = this.currentQuestion();
    
    this.quizState.update(state => ({
      ...state,
      showResult: true,
      streak: 0,
      answers: [...state.answers, { country: current!, correct: false, timeTaken: this.settings().speed }]
    }));
    
    setTimeout(() => this.nextQuestion(), 1500);
  }

  private endQuiz() {
    this.stopTimer();
    const state = this.quizState();
    const settings = this.settings();
    
    // Update saved data
    this.savedData.update(data => ({
      ...data,
      gamesPlayed: data.gamesPlayed + 1,
      totalCorrect: data.totalCorrect + state.score,
      totalQuestions: data.totalQuestions + state.answers.length,
      highScores: [
        ...data.highScores,
        { difficulty: settings.difficulty, speed: settings.speed, score: state.score, date: new Date().toISOString() }
      ].sort((a, b) => b.score - a.score).slice(0, 10)
    }));
    
    this.saveData();
    this.mode.set('results');
  }

  // Training functions
  startTraining() {
    this.trainingIndex.set(0);
    this.showFlagInTraining.set(true);
    this.mode.set('training');
  }

  nextTrainingCard() {
    const countries = this.filteredTrainingCountries();
    if (this.trainingIndex() < countries.length - 1) {
      this.trainingIndex.update(i => i + 1);
      this.showFlagInTraining.set(true);
    }
  }

  prevTrainingCard() {
    if (this.trainingIndex() > 0) {
      this.trainingIndex.update(i => i - 1);
      this.showFlagInTraining.set(true);
    }
  }

  toggleFlagVisibility() {
    this.showFlagInTraining.update(v => !v);
  }

  toggleKnown() {
    const country = this.currentTrainingCountry();
    if (!country) return;
    
    this.savedData.update(data => {
      const known = data.knownFlags.includes(country.code)
        ? data.knownFlags.filter(c => c !== country.code)
        : [...data.knownFlags, country.code];
      return { ...data, knownFlags: known };
    });
    this.saveData();
  }

  hideFlag() {
    const country = this.currentTrainingCountry();
    if (!country) return;
    
    this.savedData.update(data => ({
      ...data,
      hiddenFlags: [...data.hiddenFlags, country.code]
    }));
    this.saveData();
    
    // Move to next if available
    if (this.trainingIndex() >= this.filteredTrainingCountries().length) {
      this.trainingIndex.update(i => Math.max(0, i - 1));
    }
  }

  unhideAllFlags() {
    this.savedData.update(data => ({ ...data, hiddenFlags: [] }));
    this.saveData();
  }

  // Settings
  setDifficulty(difficulty: Difficulty) {
    this.settings.update(s => ({ ...s, difficulty }));
  }

  setSpeed(speed: Speed) {
    this.settings.update(s => ({ ...s, speed }));
  }

  // Utilities
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  getOptionClass(option: Country): string {
    const state = this.quizState();
    const current = this.currentQuestion();
    
    if (!state.showResult) {
      return 'bg-card hover:bg-accent border-border hover:border-primary/50';
    }
    
    if (option.code === current?.code) {
      return 'bg-green-500/20 border-green-500 text-green-500';
    }
    
    if (option.code === state.selectedAnswer?.code && option.code !== current?.code) {
      return 'bg-red-500/20 border-red-500 text-red-500';
    }
    
    return 'bg-card border-border opacity-50';
  }

  goToMenu() {
    this.stopTimer();
    this.mode.set('menu');
  }

  resetAllData() {
    this.savedData.set({
      knownFlags: [],
      hiddenFlags: [],
      highScores: [],
      gamesPlayed: 0,
      totalCorrect: 0,
      totalQuestions: 0
    });
    this.saveData();
  }
}
