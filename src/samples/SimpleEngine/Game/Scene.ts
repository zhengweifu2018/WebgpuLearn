import { CEntity } from "./Entity"

export class CScene {
    constructor() {
        this.m_EntityMap = new Map();
    }
    public CreateEnitity() : CEntity {
        let entity : CEntity = new CEntity();
        this.m_EntityMap.set(entity.UUID, entity);
        return entity;
    }

    public DestroyEntity(entity : CEntity) {
        if(this.m_EntityMap.has(entity.UUID))
        {
            this.m_EntityMap.delete(entity.UUID);
        }
    }

    private m_EntityMap: Map<string, CEntity>;
}