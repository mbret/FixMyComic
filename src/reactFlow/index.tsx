import React, { useEffect, Dispatch, ReducerAction, Reducer, ReducerState, useCallback, createContext, useReducer, useState, useRef, useContext, ComponentType, useMemo } from "react";

export const createFlow = <R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  effects: any[]
) => {
  const FlowContext = createContext<{
    state: ReducerState<R>;
    dispatch: Dispatch<ReducerAction<R>>;
  }>(undefined);

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

    const value = useMemo(() => ({ state, dispatch: enhancedDispatch }), [state, enhancedDispatch])

    return (
      <FlowContext.Provider value={value}>
        {children}
      </FlowContext.Provider>
    )
  }

  const useFlow = () => useContext(FlowContext)

  return {
    FlowProvider,
    useFlow,
  }
}