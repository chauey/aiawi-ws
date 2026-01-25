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
import { COUNTRIES, Country, CONTINENTS } from './flags-data';

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
    
    const options = this.shuffleArray([current, ...wrongAnswers]);
    this.currentOptions.set(options);
  }

  selectAnswer(country: Country) {
    if (this.quizState().showResult) return;
    
    this.stopTimer();
    const current = this.currentQuestion();
    const isCorrect = country.code === current?.code;
    const timeTaken = this.settings().speed - this.quizState().timeLeft;
    
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
