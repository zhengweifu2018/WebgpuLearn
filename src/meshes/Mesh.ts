import { CGeometryBuffer } from "./GeometryBuffer";
import { vec3, quat} from "gl-matrix";

export interface CMesh {
    Geometry : CGeometryBuffer;
    Position : vec3;
    Rotation : vec3;
    Scale : vec3;
}