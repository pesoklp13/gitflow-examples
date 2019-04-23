import {GitflowActions, GitflowState} from "../actions/gitflow";
import * as React from "react";
import {ReactElement} from "react";
import {BranchUserApi, GitgraphBranchOptions, GitgraphUserApi} from "@gitgraph/core"

const AUTHOR = "author";
const FEATURE_AUTHOR = "feature author";
const ANOTHER_AUTHOR = "another author";
const MASTER = "master";
const DEVELOP = "develop";

const FEATURE1_BRANCH = "feature/1";
const FEATURE2_BRANCH = "feature/2";
const FEATURE3_BRANCH = "feature/3";
const RELEASE1_BRANCH = "release/1";
const FIX1_BRANCH = "fix/1";
const HOTFIX1_BRANCH = "hotfix/1";

type ReactSVGElement = React.ReactElement<SVGElement>;

const createState = (build: (gitgraph: GitgraphUserApi<ReactSVGElement>) => void, title: string, key: string,
                     next?: string | undefined, prev?: string): GitflowState => ({
    hasNext: () => !!next,
    hasPrevious: () => !!prev,
    getNext: () => (next) ? states[next] : null,
    getPrevious: () => (prev) ? states[prev] : null,
    build,
    title,
    key
});

const enhanceWithDescription = (state: GitflowState, description: string | ReactElement<any>) => ({...state, ...{description}});

const setMain = (state: GitflowState) => ({...state, ...{main: true}});

const commitDefaultOptions = {
    author: AUTHOR,
    style: {
        // shouldDisplayTooltipsInCompactMode: false
    }
};

const initialState = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {

    const options: GitgraphBranchOptions<any> = {
        name: MASTER,
        commitDefaultOptions
    };

    const master: BranchUserApi<ReactSVGElement> = gitgraph.branch(options);

    return master.commit({
        subject: "init commit",
        author: AUTHOR
    });
};

const firstState = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    initialState(gitgraph);

    return gitgraph.branch({
        name: DEVELOP,
        commitDefaultOptions
    }).commit({
        subject: "second commit",
        author: AUTHOR
    });
};

const newFeatureState = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    firstState(gitgraph);

    return gitgraph.branch({
        name: FEATURE1_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[feature-code] - definition & unit tests",
        author: FEATURE_AUTHOR
    }).commit({
        subject: "[feature-code] - implementation",
        author: FEATURE_AUTHOR
    });
};

const newFeatureAfterCodereview = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    return newFeatureState(gitgraph).commit({
        subject: "[feature-code] - codereview comments",
        author: FEATURE_AUTHOR
    });
};

const newSecondFeature = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    newFeatureState(gitgraph);

    return gitgraph.branch(DEVELOP).branch({
        name: FEATURE2_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[feature-code] - implementation",
        author: ANOTHER_AUTHOR
    });
};

function mergeSmallFeatures(gitgraph: GitgraphUserApi<ReactSVGElement>) {
    const develop = gitgraph.branch("develop");
    develop.merge(FEATURE1_BRANCH);
    develop.merge(FEATURE2_BRANCH);

    return develop.branch(RELEASE1_BRANCH).commit({
        subject: "entry point for release",
        author: AUTHOR
    }).tag({
        name: "test.tag.1"
    });
}

const standardRelease = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    newSecondFeature(gitgraph);

    return mergeSmallFeatures(gitgraph);
};

const releaseFixingState = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    standardRelease(gitgraph).branch({
        name: FIX1_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[fix code] - fixed bug",
        author: ANOTHER_AUTHOR
    });

    return gitgraph.branch(RELEASE1_BRANCH).merge(FIX1_BRANCH).tag({
        name: "test.tag.2"
    });
};

const featureWhileReleaseState = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    releaseFixingState(gitgraph);

    return gitgraph.branch(DEVELOP).branch({
        name: FEATURE3_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[feature code] - commit message",
        author: ANOTHER_AUTHOR
    });
};

const releaseToProduction = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    featureWhileReleaseState(gitgraph);

    gitgraph.branch(DEVELOP).merge(RELEASE1_BRANCH);
    return gitgraph.branch(MASTER).merge(RELEASE1_BRANCH).tag({name: "prod.tag.1"});
};

const hotfix = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    releaseToProduction(gitgraph).branch({
        name: HOTFIX1_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[hotfix code] - commit message",
        author: FEATURE_AUTHOR
    }).tag({
        name: "staging.tag.1"
    });

    gitgraph.branch(DEVELOP).merge(HOTFIX1_BRANCH);
    return gitgraph.branch(MASTER).merge(HOTFIX1_BRANCH).tag("prod.tag.1.1");
};

const epicStarted = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    newFeatureAfterCodereview(gitgraph);

    return gitgraph.branch(DEVELOP).branch({
        name: "EPIC",
        commitDefaultOptions
    }).commit({
        subject: "Merge branch feature/epic/1",
        author: AUTHOR
    });
};

const epicInParallelWithSmallFeatures = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    const epic = epicStarted(gitgraph);

    gitgraph.branch(DEVELOP).branch({
        name: FEATURE2_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[feature-code] - implementation",
        author: ANOTHER_AUTHOR
    });

    return epic.commit({
        subject: "Merge branch feature/epic/2",
        author: AUTHOR
    }).commit({
        subject: "Merge branch feature/epic/3",
        author: ANOTHER_AUTHOR
    });
};

const epicAfterReleaseIntoProduction = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    epicInParallelWithSmallFeatures(gitgraph);

    mergeSmallFeatures(gitgraph);

    gitgraph.branch("EPIC").commit({
        subject: "Merge branch feature/epic/4",
        author: ANOTHER_AUTHOR
    });

    gitgraph.branch(DEVELOP).merge(RELEASE1_BRANCH);
    gitgraph.branch(MASTER).merge(RELEASE1_BRANCH).tag({name: "prod.tag.1"});

    return gitgraph.branch("EPIC").commit({
        subject: "Merge branch feature/epic/5",
        author: ANOTHER_AUTHOR
    });
};

const epicNewStart = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    newFeatureAfterCodereview(gitgraph);

    gitgraph.branch(DEVELOP).branch({
        name: FEATURE2_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[feature-code] - implementation",
        author: ANOTHER_AUTHOR
    });

    mergeSmallFeatures(gitgraph);

    gitgraph.branch(DEVELOP).merge(RELEASE1_BRANCH);
    gitgraph.branch(MASTER).merge(RELEASE1_BRANCH).tag({name: "prod.tag.1"});

    return gitgraph.branch(DEVELOP).branch({
        name: "EPIC",
        commitDefaultOptions
    }).commit({
        subject: "Merge branch feature/epic/1",
        author: AUTHOR
    }).commit({
        subject: "Merge branch feature/epic/2",
        author: AUTHOR
    }).commit({
        subject: "Merge branch feature/epic/3",
        author: ANOTHER_AUTHOR
    }).commit({
        subject: "Merge branch feature/epic/4",
        author: ANOTHER_AUTHOR
    }).commit({
        subject: "Merge branch feature/epic/5",
        author: ANOTHER_AUTHOR
    });
};

const featuresContinues = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    epicNewStart(gitgraph);

    const feature = gitgraph.branch(DEVELOP).branch({
        name: FEATURE3_BRANCH,
        commitDefaultOptions
    }).commit("commit 1");

    const epic = gitgraph.branch("EPIC").commit("Merge branch feature/epic/6");

    feature.commit("commit 2");

    return epic.commit("Merge branch feature/epic/7");
};

const commonFeature = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    newSecondFeature(gitgraph);

    gitgraph.branch(FEATURE1_BRANCH).commit("Common functionality");
    return gitgraph.branch(FEATURE2_BRANCH).commit("Common functionality");
};

const commonFeatureMerge = (gitgraph: GitgraphUserApi<ReactSVGElement>): BranchUserApi<any> => {
    firstState(gitgraph).branch({
        name: "feature/common",
        commitDefaultOptions
    }).commit("Common functionality");

    gitgraph.branch(DEVELOP).merge("feature/common").branch({
        name: FEATURE1_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[feature-code] - definition & unit tests",
        author: FEATURE_AUTHOR
    }).commit({
        subject: "[feature-code] - implementation",
        author: FEATURE_AUTHOR
    }).commit({
        subject: "[feature-code] - codereview comments",
        author: FEATURE_AUTHOR
    });

    return gitgraph.branch(DEVELOP).branch({
        name: FEATURE2_BRANCH,
        commitDefaultOptions
    }).commit({
        subject: "[feature-code] - implementation",
        author: ANOTHER_AUTHOR
    });
};

export const states: { [key: string]: GitflowState } = {
    "initial": setMain(enhanceWithDescription(createState(initialState, "Initial commit", "initial", "develop"),
        "This is first commit")),
    "develop": setMain(enhanceWithDescription(createState(firstState, "First commit", "develop", "new-feature", "initial"),
        "In the meantime some data was implemented and already in development branch")),
    "new-feature": setMain(enhanceWithDescription(
        createState(newFeatureState, "New feature implementation", "new-feature", "new-feature-2", "develop"),
        (<div>
            <p>When new feature or task should be implemented, start with new feature branch.</p>
            <p>Prepare definitions (contract), implement unit tests & implementation</p>
        </div>)
    )),
    "new-feature-2": enhanceWithDescription(
        createState(newFeatureAfterCodereview, "New feature codereview", "new-feature-2", "new-feature-3", "new-feature"),
        (<div>
            <p>After codereview there can be possibly need of change already implemented feature</p>
        </div>)
    ),
    "new-feature-3": enhanceWithDescription(
        createState(newSecondFeature, "New feature started", "new-feature-3", "release-1", "new-feature-2"),
        (<div><p>Another feature started so it must start from <b>development</b> branch</p></div>)
    ),
    "release-1": setMain(
        enhanceWithDescription(
            createState(standardRelease, "Release features", "release-1", "release-2", "new-feature-3"),
            (<div>
                <p>All features which should be part of release has to be merged into <b>development</b> branch</p>
                <p>After that <b>release</b> branch has to be created.</p>
                <p>In this point whole bundle should be release on test environment. (define tag)</p>
            </div>)
        )
    ),
    "release-2": enhanceWithDescription(
        createState(releaseFixingState, "Release fixes into test", "release-2", "feature-while-release", "release-1"),
        (<div>
            <p>After tests some fixes should be made.</p>
            <p>Now the fixes should come from <b>release</b> branch instead of <b>development</b></p>
            <p>Bug should be fixed by <b>feature's</b> implementor</p>
            <p>After it's implementation just merge it and deploy into test environment and retest.</p>
        </div>)
    ),
    "feature-while-release": enhanceWithDescription(
        createState(featureWhileReleaseState, "Start new feature", "feature-while-release", "release-3", "release-2"),
        (<div>
            <p>Development is not stopped while release is in process.</p>
            <p>Every new feature will start from <b>development</b> branch as usually</p>
        </div>)
    ),
    "release-3": enhanceWithDescription(
        createState(releaseToProduction, "Release to production", "release-3", "hotfix", "feature-while-release"),
        (<div>
            <p>After test passed there changes can be deployed into <b>staging/pre-production</b> environment to user
                acceptance tests</p>
            <p>After acceptance tests deployment process will start</p>
        </div>)
    ),
    "hotfix": enhanceWithDescription(
        createState(hotfix, "Hotfix production problem", "hotfix", "epic-1", "release-3"),
        (<div>
            <p>When acceptance testing or production (user detect bugs) and bugs are critical, hotfix has to be
                made.</p>
            <p>Create branch from <b>master</b>. Fix the problem. Deploy</p>
            <p>Notice: For <b>staging</b> failed tests is used same rule as for bug fixes from <b>test environment</b>.
            </p>
        </div>)
    ),
    "epic-1": setMain(
        enhanceWithDescription(
            createState(epicStarted, "Long term feature/epic", "epic-1", "epic-2", "hotfix"),
            (<div>
                <p>There will be need to do standalone development on long term feature/epic</p>
                <p>We should have created temporary <b>development branch for epic</b></p>
                <p>Whole rules are same as for <b>development</b> branch itself, with some specific rules.</p>
            </div>)
        )
    ),
    "epic-2": enhanceWithDescription(
        createState(epicInParallelWithSmallFeatures, "Parallel implementation with small features", "epic-2", "epic-3", "epic-1"),
        (<div>
            <p>All epic features & small features are implemented in parallel</p>
        </div>)
    ),
    "epic-3": enhanceWithDescription(
        createState(epicAfterReleaseIntoProduction, "Release small features into production", "epic-3", "epic-4", "epic-2"),
        (<div>
            <p>Whole deployment process for small features is same as before.</p>
            <p>Notice: Fixes & Hot-fixes are skipped from picture to stay more readable</p>
        </div>)
    ),
    "epic-4": enhanceWithDescription(
        createState(epicNewStart, "Rebase Epic onto develop branch", "epic-4", "features-continue", "epic-3"),
        (<div>
            <p>To be able to stay in touch with current production codebase, epic should be rebased onto develop</p>
            <p>Rebase can be made also sooner (e.g. in phase when it is deployed into test), to eliminate gaps between codebase's</p>
        </div>)
    ),
    "features-continue": enhanceWithDescription(
        createState(featuresContinues, "Continue with implementations", "features-continue", "common-feature", "epic-4"),
        "Development after rebase will continue as before, but with rebased Epic"
    ),
    "common-feature": setMain(
        enhanceWithDescription(
            createState(commonFeature, "Common Feature", "common-feature", "common-feature-impl", "features-continue"),
            (<div>
                <p>Sometimes while implementing some feature, two features should use same functionality</p>
                <p>This functionality should be merged into development and rebased into given features</p>
            </div>)
        )
    ),
    "common-feature-impl": enhanceWithDescription(
        createState(commonFeatureMerge, "Common feature merge", "common-feature-impl", undefined, "common-feature"),
        (<div>
            <p>This functionality should be merged into development and rebased into given features</p>
        </div>)
    )
};


export const prepareNext = (action: GitflowActions): GitflowState => {
    const gitgraph = action.payload.gitgraph as GitgraphUserApi<React.ReactElement<SVGElement>>;
    const gitflowState = action.payload.state as GitflowState;

    gitgraph.clear();

    const newGitflowState = gitflowState.getNext();

    if (newGitflowState) {
        newGitflowState.build(gitgraph);
        return newGitflowState;
    }

    return gitflowState;
};

export const preparePrevious = (action: GitflowActions): GitflowState => {
    const gitgraph = action.payload.gitgraph as GitgraphUserApi<React.ReactElement<SVGElement>>;
    const gitflowState = action.payload.state as GitflowState;

    gitgraph.clear();

    const newGitflowState = gitflowState.getPrevious();

    if (newGitflowState) {
        newGitflowState.build(gitgraph);
        return newGitflowState;
    }

    return gitflowState;
};

export const prepareSpecific = (action: GitflowActions): GitflowState => {
    const gitgraph = action.payload.gitgraph as GitgraphUserApi<React.ReactElement<SVGElement>>;

    gitgraph.clear();

    const actionName = action.payload.actionName as string;

    const state = states[actionName];
    state.build(gitgraph);

    return state;
};

export const initialize = (): GitflowState => {
    return states.initial;
};