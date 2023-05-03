import { vec3 } from 'gl-matrix';

type ProjectedPlane = 'xy' | 'xz' | 'yz';

const ProjectedPlane2Ids: { [key in ProjectedPlane]: [number, number] } = {
	xy: [0, 1],
	xz: [0, 2],
	yz: [1, 2]
};

export class CGeometryBuffer {
    Positions : Float32Array;
    Triangles : Uint32Array;
    Normals: Float32Array;
    UVs: Float32Array;

    constructor() {
        this.Positions = new Float32Array(0);
        this.Triangles = new Uint32Array(0);
        this.Normals = new Float32Array(0);
        this.UVs = new Float32Array(0);
    }

    // 每个点的字节间隔
    GetNumStrides() {
        let numStrides = 0;
        if(this.Positions.length > 0) {
            numStrides += 12;
        }

        if(this.Normals && this.Normals.length > 0) {
            numStrides += 12;
        }

        if(this.UVs && this.UVs.length > 0) {
            numStrides += 8;
        }

        return numStrides;
    }

    GetBufferArray() {
        let bufferArray = new Float32Array(this.Positions.length + this.Normals.length + this.UVs.length);
        let steps = this.GetNumStrides() / 4;
        for(let i = 0, pi = 0, ti = 0; i < bufferArray.length; i += steps, pi += 3, ti += 2) {
            let offset = 0;
            if(this.Positions.length > 0) {
                bufferArray[i+offset+0] = this.Positions[pi+0];
                bufferArray[i+offset+1] = this.Positions[pi+1];
                bufferArray[i+offset+2] = this.Positions[pi+2];
                offset += 3;
            }
            if(this.Normals && this.Normals.length > 0) {
                bufferArray[i+offset+0] = this.Normals[pi+0];
                bufferArray[i+offset+1] = this.Normals[pi+1];
                bufferArray[i+offset+2] = this.Normals[pi+2];
                offset += 3;
            }
            if(this.UVs && this.UVs.length > 0) {
                bufferArray[i+offset+0] = this.UVs[ti+0];
                bufferArray[i+offset+1] = this.UVs[ti+1];
                offset += 2; 
            }
        }
        return bufferArray;
    }

    GetAttributes() {
        let attributes = [];
        let shaderLocation = 0;
        let offset = 0;
        if(this.Positions.length > 0) {
            attributes.push({
                shaderLocation: shaderLocation,
                format: "float32x3",
                offset: offset
            });
            shaderLocation += 1;
            offset += 12;
        }
        
        if(this.Normals && this.Normals.length > 0) {
            attributes.push({
                shaderLocation: shaderLocation,
                format: "float32x3",
                offset: offset
            });
            shaderLocation += 1;
            offset += 12;
        }

        if(this.UVs && this.UVs.length > 0) {
            attributes.push({
                shaderLocation: shaderLocation,
                format: "float32x2",
                offset: offset
            });
            shaderLocation += 1;
            offset += 8;
        }

        return attributes;
    }

    ComputeNormals() {
        this.Normals = new Float32Array(this.Positions.length);
        for(let i = 0; i < this.Triangles.length; i += 3) {
            const i0 = this.Triangles[i+0] * 3, i1 = this.Triangles[i+1] * 3, i2 = this.Triangles[i+2] * 3;
            // const i3 = this.Triangles[i+3], i4 = this.Triangles[i+4], i5 = this.Triangles[i+5];
            // const i6 = this.Triangles[i+6], i7 = this.Triangles[i+7], i8 = this.Triangles[i+8];

            const p0: vec3 = vec3.fromValues(this.Positions[i0+0], this.Positions[i0+1], this.Positions[i0+2]);
            const p1: vec3 = vec3.fromValues(this.Positions[i1+0], this.Positions[i1+1], this.Positions[i1+2]);
            const p2: vec3 = vec3.fromValues(this.Positions[i2+0], this.Positions[i2+1], this.Positions[i2+2]);
    
            let v0: vec3 = vec3.create();
            let v1: vec3 = vec3.create();
            vec3.subtract(v0, p1, p0);
            vec3.subtract(v1, p2, p0);
    
            vec3.normalize(v0, v0);
            vec3.normalize(v1, v1);

            let normal = vec3.create();
            vec3.cross(normal, v0, v1);

            let n0: vec3 = vec3.fromValues(this.Normals[i0+0], this.Normals[i0+1], this.Normals[i0+2]);
            let n1: vec3 = vec3.fromValues(this.Normals[i1+0], this.Normals[i1+1], this.Normals[i1+2]);
            let n2: vec3 = vec3.fromValues(this.Normals[i2+0], this.Normals[i2+1], this.Normals[i2+2]);

            vec3.add(n0, normal, n0);
            vec3.add(n1, normal, n1);
            vec3.add(n2, normal, n2);

            this.Normals[i0+0] = n0[0]; this.Normals[i0+1] = n0[1]; this.Normals[i0+2] = n0[2];
            this.Normals[i1+0] = n1[0]; this.Normals[i1+1] = n1[1]; this.Normals[i1+2] = n1[2];
            this.Normals[i2+0] = n2[0]; this.Normals[i2+1] = n2[1]; this.Normals[i2+2] = n2[2];
        }

        for(let i = 0; i < this.Normals.length; i += 3) {
            let normal: vec3 = vec3.fromValues(this.Normals[i+0], this.Normals[i+1], this.Normals[i+2]);
            vec3.normalize(normal, normal);
            this.Normals[i+0] = normal[0]; this.Normals[i+1] = normal[1]; this.Normals[i+2] = normal[2];
        }
    }

    ComputeProjectedPlaneUVs(projectedPlane: ProjectedPlane = 'xy') {
        const idxs = ProjectedPlane2Ids[projectedPlane];
        const extentMin = [Infinity, Infinity];
        const extentMax = [-Infinity, -Infinity];

        this.UVs = new Float32Array(this.Positions.length / 3 * 2);

        for(let pi = 0, ti = 0; pi < this.Positions.length; pi += 3, ti += 2) {
            const pos: vec3 = vec3.fromValues(this.Positions[pi+0], this.Positions[pi+1], this.Positions[pi+2]); 
            this.UVs[ti+0] = pos[idxs[0]];
            this.UVs[ti+1] = pos[idxs[1]];
    
            extentMin[0] = Math.min(pos[idxs[0]], extentMin[0]);
            extentMin[1] = Math.min(pos[idxs[1]], extentMin[1]);
            extentMax[0] = Math.max(pos[idxs[0]], extentMax[0]);
            extentMax[1] = Math.max(pos[idxs[1]], extentMax[1]);
        }

        for(let ti = 0; ti < this.UVs.length; ti += 2) {
            this.UVs[ti+0] = (this.UVs[ti+0] - extentMin[0]) / (extentMax[0] - extentMin[0]);
            this.UVs[ti+1] = (this.UVs[ti+1] - extentMin[1]) / (extentMax[1] - extentMin[1]);
        }
    }
}