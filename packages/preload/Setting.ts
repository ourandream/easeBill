import { ipcRenderer } from "electron";

let Settings = {
    changeCategory: (type: 'income' | 'spending' | 'transfer' | 'accounts',
        op: 'add' | 'remove' | 'replace',
        val: string,
        optionVal?: string,
        optionVal2?: string) =>
        ipcRenderer.invoke('setCategory', type, op, val, optionVal, optionVal2)
}

export default Settings