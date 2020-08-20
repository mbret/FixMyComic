import React, { useEffect, Dispatch, ReducerAction, Reducer, ReducerState, useCallback, createContext, useReducer, useState, useRef, useContext, ComponentType, useMemo } from "react";

export const createFlow = <R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  effects: any[]
) => {
  // @todo use FlowContext = { value, onChange } with event listener to avoid re-rendering all the time
  const FlowContext = createContext<ReducerState<R>>(undefined);
  const DispatchContext = createContext<Dispatch<ReducerAction<R>>>(undefined);

  type Props = {
    children: React.ReactNode;
  }
  const FlowProvider = ({ children }: Props) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const [newAction, setNewAction] = useState(undefined)
    const stateRef = useRef(state)
    stateRef.current = state

    const enhancedDispatch = useCallback((action) => {
      dispatch(action)
      setNewAction(action)
    }, [dispatch])

    useEffect(() => {
      Promise
        .all(effects.map(effect => effect(newAction, enhancedDispatch, () => stateRef.current)))
    }, [newAction, enhancedDispatch])

    const value = useMemo(() => state, [state])

    return (
      <FlowContext.Provider value={value}>
        <DispatchContext.Provider value={enhancedDispatch}>
          {children}
        </DispatchContext.Provider>
      </FlowContext.Provider>
    )
  }

  function useFlowState <G = ReducerState<R>>(selector: (state: ReducerState<R>) => G = state => state) {
    const state = useContext(FlowContext)
    const derivatedState = selector(state)

    return useMemo(() => derivatedState, [derivatedState])
  }

  const useDispatch = () => useContext(DispatchContext)

  return {
    FlowProvider,
    useState: useFlowState,
    useDispatch,
  }
}