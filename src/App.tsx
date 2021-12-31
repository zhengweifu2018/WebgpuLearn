import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Switch,  Route } from 'react-router-dom'; 

import TrianglePage from './pages/TrianglePage';
import QuadranglePage from './pages/QuadranglePage';

let App:React.FC = () => {
    return <div>
        <Route exact path='/' component={QuadranglePage} />
        <Route exact path='/triangle' component={TrianglePage} />
        {/* <Route exact path='/quadrangle' component={QuadranglePage} /> */}
    </div>
}

ReactDOM.render(<HashRouter>
	<App />
</HashRouter>, document.getElementById('app'));