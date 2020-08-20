import { Reducer, Dispatch } from "react"

export const initialState: {
  backup: boolean;
  rtl: boolean;
  fixedLayout: boolean;
  fixing: boolean;
  fixingProgress: number;
  lastFixingError: Error | null;
  files: string[];
  selectedInputFormat: 'epub-calibre';
} = {
  backup: true,
  rtl: false,
  fixedLayout: true,
  fixing: false,
  fixingProgress: 0,
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
  | { type: 'FIXING_UPDATE_PROGRESS'; payload: number }
  | { type: 'UPDATE_FORM'; payload: { rtl: boolean; fixedLayout: boolean } }

export type Effect = (action: AppAction, dispatch: Dispatch<AppAction>, getState: () => AppState) => void

export const reducer: Reducer<AppState, AppAction> = (state, action) => {
  console.log('reducer', action)
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
        fixingProgress: 0,
        lastFixingError: action.payload,
      }

    case 'FIXING_UPDATE_PROGRESS':
      return {
        ...state,
        fixingProgress: action.payload,
      }

    case 'UPDATE_FORM':
      return {
        ...state,
        ...action.payload,
      }

    default: return state
  }
}
