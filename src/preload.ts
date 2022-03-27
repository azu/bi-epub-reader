import { contextBridge, ipcRenderer } from "electron";

export const API = {
    async loadBook() {
        return ipcRenderer.invoke("loadBook")
            .then(result => result)
            .catch(() => null)
    }
}
contextBridge.exposeInMainWorld("api", API);

