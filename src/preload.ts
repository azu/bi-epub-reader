import { contextBridge, ipcRenderer } from "electron";

export const API = {
    loadBook() {
        console.log("epub");
        return ipcRenderer.invoke("loadBook")
            .then(result => result)
            .catch(() => null)
    }
}
contextBridge.exposeInMainWorld("api", API);

