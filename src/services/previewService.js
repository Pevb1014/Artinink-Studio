import {initialState} from '../core/domainState.js';
export const createPreviewState=(overrides={})=>({...initialState,...overrides});
