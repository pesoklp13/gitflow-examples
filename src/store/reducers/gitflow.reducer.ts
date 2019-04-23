import {GITFLOW_ACTION, GitflowActions, GitflowState} from "../actions/gitflow";
import {Reducer} from "redux";
import {initialize, prepareNext, preparePrevious, prepareSpecific} from "../service/gitflow.service";

export const gitflowReducer: Reducer<GitflowState, GitflowActions> =
    (state: GitflowState = initialize(), action: GitflowActions) => {
        switch (action.type) {
            case GITFLOW_ACTION.NEXT:
                return prepareNext(action);
            case GITFLOW_ACTION.PREV:
                return preparePrevious(action);
            case GITFLOW_ACTION.SPECIFIC:
                return prepareSpecific(action);
            default:
                return state;
        }
    };