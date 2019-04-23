import {GITFLOW_ACTION, GitflowNextAction, GitflowPreviousAction, GitflowSpecificAction, GitflowState} from "./gitflow";
import {ActionCreator} from "redux";
import {ReactElement} from "react";
import {GitgraphUserApi} from "@gitgraph/core";

export const nextGitflowState: ActionCreator<GitflowNextAction> =
    (gitgraph: GitgraphUserApi<ReactElement<SVGElement>>,
     state: GitflowState) => ({
        type: GITFLOW_ACTION.NEXT,
        payload: {
            gitgraph,
            state
        }
    });

export const previousGitflowState: ActionCreator<GitflowPreviousAction> =
    (gitgraph: GitgraphUserApi<ReactElement<SVGElement>>,
     state: GitflowState) => ({
        type: GITFLOW_ACTION.PREV,
        payload: {
            gitgraph,
            state
        }
    });

export const specificGitflowState: ActionCreator<GitflowSpecificAction> =
    (gitgraph: GitgraphUserApi<ReactElement<SVGElement>>, actionName: string) => ({
        type: GITFLOW_ACTION.SPECIFIC,
        payload: {
            gitgraph,
            actionName
        }
    });