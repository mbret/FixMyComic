import { createFlow } from "./reactFlow";
import { reducer, initialState } from "./reducers";
import * as effects from './effects';

const { FlowProvider, useState, useDispatch } = createFlow(reducer, initialState, Object.values(effects))

export {
  FlowProvider,
  useState,
  useDispatch,
}