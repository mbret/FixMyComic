import { createFlow } from "./reactFlow";
import { reducer, initialState } from "./reducers";
import * as effects from './effects';

const { FlowProvider, useFlow } = createFlow(reducer, initialState, Object.values(effects))

export {
  FlowProvider,
  useFlow
}