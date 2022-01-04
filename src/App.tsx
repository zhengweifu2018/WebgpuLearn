// https://segmentfault.com/a/1190000040716735
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Switch,  Route } from 'react-router-dom'; 

import CanvasPage from './pages/CanvasPage';

let App:React.FC = () => {
    return <div>
        {/* e.g: xxx:xxx/#/webgpu/shader_triangle */}
        <Route exact path='/webgpu/:sample' component={CanvasPage} />
    </div>
}

ReactDOM.render(<HashRouter>
	<App />
</HashRouter>, document.getElementById('app'));