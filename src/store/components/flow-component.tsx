import * as React from "react";
import {GitgraphUserApi} from '@gitgraph/core';
import {connect} from "react-redux";
import {states} from "../service/gitflow.service";
import {Dispatch} from "redux";
import {specificGitflowState} from "../actions/gitflow.creators";
import {GitflowState} from "../actions/gitflow";

export interface FlowComponentProps {
    gitflow: GitflowState,
    gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>,
    jumpTo: (gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>, name: string) => void;
}

// tslint:disable:all
export const FlowComponentRenderer = (props: FlowComponentProps) => (
    <div className={"list-of-states"}>
        <h2>List of states</h2>
        <ul>
            {Object.keys(states).map(key => (
                <li key={key}>
                    <button
                        className={"button-link " + (props.gitflow.key === key ? " disabled" : "") + (!states[key].main? " sub": "")}
                        onClick={() => {
                            props.jumpTo(props.gitgraph, key)
                        }}
                    >{states[key].main ? <i className={"right-arrow"}/> : null} {states[key].title}</button>
                </li>
            ))}
        </ul>
    </div>
);

const mapStateToProps = (state: any) => ({
    gitflow: state.gitflow
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    jumpTo: (gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>, name: string) =>
        (dispatch(specificGitflowState(gitgraph, name)))
});

export const FlowComponent = connect(mapStateToProps, mapDispatchToProps)(FlowComponentRenderer);