import * as React from 'react';
import './App.css';
import {RepoComponent} from "./store/components/repo-component";

class App extends React.Component {

    public render(): React.ReactNode {
        return (
            <div className="App">
                <RepoComponent/>
            </div>
        );
    }
}

export default App;
