import type { AppAction, AppState } from "../types/state";

export const initialState: AppState = {
  items: [],
  orders: [],
  returns: [],
  returnRequests: [],
  isDataLoaded: false,

  dateRange: { from: null, to: null },
  selectedCategories: [],
  searchQuery: "",

  activeView: "overview",
  isImporting: false,
  importProgress: 0,
  importError: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "IMPORT_START":
      return {
        ...state,
        isImporting: true,
        importProgress: 0,
        importError: null,
      };
    case "IMPORT_PROGRESS":
      return { ...state, importProgress: action.progress };
    case "IMPORT_COMPLETE":
      return {
        ...state,
        items: action.items,
        orders: action.orders,
        returns: action.returns,
        returnRequests: action.returnRequests,
        isDataLoaded: true,
        isImporting: false,
        importProgress: 100,
        importError: null,
      };
    case "IMPORT_ERROR":
      return {
        ...state,
        isImporting: false,
        importError: action.error,
      };
    case "SET_DATE_RANGE":
      return { ...state, dateRange: action.range };
    case "SET_CATEGORIES":
      return { ...state, selectedCategories: action.categories };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_VIEW":
      return { ...state, activeView: action.view };
    case "CLEAR_DATA":
      return initialState;
    default:
      return state;
  }
}
