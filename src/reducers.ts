import { Reducer, Dispatch } from "react"

export const initialState: {
  backup: boolean;
  rtl: boolean;
  fixedLayout: boolean;
  createOrFixAppleOptions: boolean;
  fixing: boolean;
  fixingProgress: { [key: string]: number };
  lastFixingError: Error | null;
  files: string[];
  selectedInputFormat: 'epub-calibre';
} = {
  backup: true,
  rtl: false,
  fixedLayout: true,
  createOrFixAppleOptions: true,
  fixing: false,
  fixingProgress: {},
  lastFixingError: null,
  files: [],
  selectedInputFormat: 'epub-calibre'
}

export type AppState = typeof initialState

export type AppAction =
  | { type: 'FIX_START' }
  | { type: 'FIX_SUCCESS' }
  | { type: 'FIX_FAILED'; payload: Error }
  | { type: 'UPDATE_FILES'; payload: File[] }
  | { type: 'ADD_FIXING_PROGRESS_TASK'; payload: string }
  | { type: 'UPDATE_FIXING_PROGRESS'; payload: { key: string; progress: number } }
  | { type: 'UPDATE_FORM'; payload: { rtl?: boolean; fixedLayout?: boolean; createOrFixAppleOptions?: boolean } }

export type Effect = (action: AppAction, dispatch: Dispatch<AppAction>, getState: () => AppState) => void

export const reducer: Reducer<AppState, AppAction> = (state, action) => {
  console.log('reducer', action, state)
  switch (action.type) {
    case 'UPDATE_FILES':
      return {
        ...state,
        files: action.payload.map(f => f.path)
      }

    case 'FIX_START':
      return {
        ...state,
        fixing: true,
        fixingProgress: {},
      }

    case 'FIX_SUCCESS':
      return {
        ...state,
        fixing: false,
        lastFixingError: null,
      }

    case 'FIX_FAILED':
      return {
        ...state,
        fixing: false,
        fixingProgress: {},
        lastFixingError: action.payload,
      }

    case 'ADD_FIXING_PROGRESS_TASK':
      return {
        ...state,
        fixingProgress: {
          ...state.fixingProgress,
          [action.payload]: 0,
        },
      }

    case 'UPDATE_FIXING_PROGRESS':
      return {
        ...state,
        fixingProgress: {
          ...state.fixingProgress,
          [action.payload.key]: action.payload.progress
        },
      }

    case 'UPDATE_FORM':
      return {
        ...state,
        ...action.payload,
      }

    default: return state
  }
}

export const getTotalFixingProgress = (state: AppState) => {
  const taskValues = Object.values(state.fixingProgress)

  return taskValues.reduce((progress, value) => progress + value, 0) / taskValues.length
}