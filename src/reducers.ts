import { Reducer, Dispatch } from "react"

export const initialState: {
  fixing: boolean;
  fixingProgress: number;
  files: string[];
  selectedInputFormat: 'epub-calibre';
} = {
  fixing: false,
  fixingProgress: 0,
  files: [],
  selectedInputFormat: 'epub-calibre'
}

export type AppState = typeof initialState

export type AppAction =
  | { type: 'FIX_START' }
  | { type: 'FIX_SUCCESS' }
  | { type: 'FIX_FAILED' }
  | { type: 'UPDATE_FILES'; payload: File[] }
  | { type: 'FIXING_UPDATE_PROGRESS'; payload: number }

export type Effect = (action: AppAction, dispatch: Dispatch<AppAction>, getState: () => AppState) => void

export const reducer: Reducer<AppState, AppAction> = (state, action) => {
  console.log('run reducer')
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
      }
    case 'FIX_FAILED':
      return {
        ...state,
        fixing: false,
        fixingProgress: 0,
      }
    case 'FIXING_UPDATE_PROGRESS':
      return {
        ...state,
        fixingProgress: action.payload,
      }
    default: return state
  }
}
