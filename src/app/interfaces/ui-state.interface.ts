export type ViewType = "myFiles" | "receivedFiles" | "myDrive" | "uploadForm"

export interface UiStateInterface {
    currentView: ViewType
    currentSearchTerm: string
    isFilterActive: boolean
    selectedTags: string[]
}
