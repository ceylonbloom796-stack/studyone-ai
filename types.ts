
export type Language = 'en' | 'si' | 'ta';

export interface Flashcard {
  front: string;
  back: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SearchSource {
  title: string;
  uri: string;
  snippet: string;
}

export interface StudySet {
  title: string;
  summary: string;
  flashcards: Flashcard[];
  mcqs: MCQ[];
}

export type ViewState = 'upload' | 'summary' | 'flashcards' | 'mcqs';
