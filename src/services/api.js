export const mockAPI = () => ({
    components: new Map(),

    async saveComponent(component) {
        const id = Math.random().toString(36).substr(2, 9);
        this.components.set(id, {
            id,
            code: component,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return { id };
    },

    async getComponent(id) {
        const component = this.components.get(id);
        if (!component) throw new Error('Component not found');
        return component;
    },

    async updateComponent(id, component) {
        const existing = this.components.get(id);
        if (!existing) throw new Error('Component not found');

        const updated = {
            ...existing,
            code: component,
            updatedAt: new Date().toISOString()
        };
        this.components.set(id, updated);
        return updated;
    },

    async saveFileContent(fileName, content) {
        console.log(`Agent will save file: ${fileName} with content: ${content.substring(0, 100)}...`);
        return { success: true };
    }
});

