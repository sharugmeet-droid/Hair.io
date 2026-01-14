
export interface HairstyleSuggestion {
  styleName: string;
  description: string;
  reason: string;
}

export interface AppState {
  originalImage: string | null;
  editedImage: string | null;
  suggestions: HairstyleSuggestion[];
  customHairstyle: string;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}
