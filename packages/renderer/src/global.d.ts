export { }

interface win{
  max:()=>void
  min:()=>void
  close:()=>void
  default:()=>void
}

declare global {
  interface Window {
    api: typeof import('../../preload/DataApi')['default'],
    Setting: typeof import('../../preload/Setting')['default'],
    removeLoading: () => void,
    win:win
  }
}