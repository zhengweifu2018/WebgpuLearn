import React from "react";
import { CreateBufferQuadrangle } from "../core/drawBufferQuadrangle";

class QuadranglePage extends React.Component { 
    componentDidMount() { 
        if (navigator.gpu) {
            CreateBufferQuadrangle("webgpu-learn-canvas");
        }
    }
    render(): React.ReactNode {
        return <div>
            {navigator.gpu ? <canvas id="webgpu-learn-canvas" width="640" height="480"></canvas> : "当前浏览器不支持WebGPU!"}
        </div>
    }
}

export default QuadranglePage;