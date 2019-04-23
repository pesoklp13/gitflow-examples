import {ReactElement} from "react";
import {Action} from "redux";
import {GitgraphUserApi} from '@gitgraph/core';

export enum GITFLOW_ACTION {
    NEXT = "@gitflow/next",
    PREV = "@gitflow/previous",
    SPECIFIC = "@gitflow/specific"
}

export interface GitflowState {
    key: string;
    description?: string | ReactElement<any>;
    title: string;
    hasNext: () => boolean;
    hasPrevious: () => boolean;
    getNext: () => GitflowState | null,
    getPrevious: () => GitflowState | null,
    build: (gitgraph: GitgraphUserApi<ReactElement<SVGElement>>) => void,
    main?: boolean
}

export interface GitflowActionPayload {
    gitgraph: GitgraphUserApi<ReactElement<SVGElement>>,
    state: GitflowState,
    actionName?: string
}

export interface GitflowNextAction extends Action<GITFLOW_ACTION> {
    type: GITFLOW_ACTION.NEXT,
    payload: GitflowActionPayload
}

export interface GitflowPreviousAction extends Action<GITFLOW_ACTION> {
    type: GITFLOW_ACTION.PREV,
    payload: GitflowActionPayload
}

export interface GitflowSpecificAction extends Action<GITFLOW_ACTION> {
    type: GITFLOW_ACTION.SPECIFIC,
    payload: Partial<GitflowActionPayload>
}

export type GitflowActions = GitflowNextAction | GitflowPreviousAction | GitflowSpecificAction;