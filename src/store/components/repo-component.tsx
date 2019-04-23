import * as React from "react";
import {Gitgraph, Orientation, TemplateName} from "@gitgraph/react";
import {GitgraphUserApi} from "@gitgraph/core"
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {GitflowState} from "../actions/gitflow";
import {nextGitflowState, previousGitflowState} from "../actions/gitflow.creators";
import {FlowComponent} from "./flow-component";

interface RepoProps {
    gitflow: GitflowState,
    nextGitflowState: (gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>,
                       state: GitflowState) => void,
    previousGitflowState: (gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>,
                           state: GitflowState) => void
}


// tslint:disable:all
class RepoComponentRenderer extends React.Component<RepoProps, GitflowState> {

    private $gitgraph = React.createRef<any>();

    constructor(props: Readonly<RepoProps>) {
        super(props);
    }

    componentDidMount(): void {
        this.setState({}); // hack to receive $gitgraph ref
    }

    public render(): React.ReactNode {
        return (
            <div className={"container column fullHeight"}>
                <h1 className={"container center"}>{this.props.gitflow.title}</h1>
                <div className={"container item"}>
                    <aside className={"left"}>
                        <h2>Description</h2>
                        <div>
                            {this.props.gitflow.description}
                        </div>
                        {(this.$gitgraph.current) ?
                            <FlowComponent gitgraph={this.$gitgraph.current.getGitgraph()}/> : null}
                    </aside>
                    <main className={"content item"}>
                        <Gitgraph ref={this.$gitgraph} options={
                            {
                                template: TemplateName.Metro,
                                orientation: Orientation.VerticalReverse,
                                author: "author"
                            }
                        }>
                            {(gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>) => {
                                this.props.gitflow.build(gitgraph);
                            }}
                        </Gitgraph>
                        <div>
                            <button className={"button " + (this.props.gitflow.hasPrevious() ? "" : "disabled")}
                                    onClick={() => {
                                        if (this.props.gitflow.hasPrevious()) {
                                            this.props.previousGitflowState(this.$gitgraph.current.getGitgraph(), this.props.gitflow);
                                        }
                                    }}>previous state
                            </button>

                            <button className={"button " + (this.props.gitflow.hasNext() ? "" : "disabled")}
                                    onClick={() => {
                                        if (this.props.gitflow.hasNext()) {
                                            this.props.nextGitflowState(this.$gitgraph.current.getGitgraph(), this.props.gitflow);
                                        }
                                    }}>next state
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: any) => ({
    gitflow: state.gitflow
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    nextGitflowState: (gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>,
                       state: GitflowState) => {
        dispatch(nextGitflowState(gitgraph, state));
    },
    previousGitflowState: (gitgraph: GitgraphUserApi<React.ReactElement<SVGElement>>,
                           state: GitflowState) => {
        dispatch(previousGitflowState(gitgraph, state));
    }
});


export const RepoComponent = connect(
    mapStateToProps,
    mapDispatchToProps
)(RepoComponentRenderer);