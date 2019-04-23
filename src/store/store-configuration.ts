import {applyMiddleware, combineReducers, createStore, Store} from "redux";
import {logger} from "redux-logger";
import {gitflowReducer} from "./reducers/gitflow.reducer";
import {composeWithDevTools} from "redux-devtools-extension";

const reducers = combineReducers({gitflow: gitflowReducer});

// TODO set application state interface
const configureStore = (initialState?: any) : Store<any> => {
    return createStore(
        reducers,
        initialState,
        composeWithDevTools(applyMiddleware(logger))
    );
};

export const store: Store = configureStore();

