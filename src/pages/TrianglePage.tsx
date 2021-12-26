import React from "react";
import { CreateTrangle } from "../core/drawTriangle";

class TrianglePage extends React.Component { 
    componentDidMount() { 
        if (navigator.gpu) {
            CreateTrangle("webgpu-learn-canvas");
        }
    }
    render(): React.ReactNode {
        return <div>
            {navigator.gpu ? <canvas id="webgpu-learn-canvas" width="640" height="480"></canvas> : "当前浏览器不支持WebGPU!"}
        </div>
    }
}

export default TrianglePage;