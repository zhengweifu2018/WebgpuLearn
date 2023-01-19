import { CMath } from "../Math/Math";
import { CComponent } from "./Component"

export class CEntity {
    constructor() {
        this.m_UUID = CMath.GenerateUUID();
        this.m_ComponentMap = new Map();
    }

    AddComponent(...components: Array<CComponent>) {
        components.forEach((component: CComponent) => {
            if(!this.m_ComponentMap.has(component.UUID)) {
                this.m_ComponentMap.set(component.UUID, component);
            }
        })
    }

    RemoveComponent(component: CComponent) {
        if(this.m_ComponentMap.has(component.UUID))
        {
            this.m_ComponentMap.delete(component.UUID);
        }
    }

    get UUID() {
        return this.m_UUID;
    }

    private m_ComponentMap: Map<string, CComponent>;
    private m_UUID : string;
}