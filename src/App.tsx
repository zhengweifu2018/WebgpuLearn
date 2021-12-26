import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch,  Route } from 'react-router-dom'; 

import TrianglePage from './pages/TrianglePage';

let App:React.FC = () => {
    return <Switch>
        <Route exact path='/' component={TrianglePage} />
	</Switch>
}

ReactDOM.render(<BrowserRouter>
	<App />
</BrowserRouter>, document.getElementById('app'));