import type {
  OrderAggregate,
  OrderItem,
  ProductCategory,
  ReturnRecord,
  ReturnRequest,
} from "./order";

export type ViewId =
  | "overview"
  | "spending"
  | "patterns"
  | "categories"
  | "returns"
  | "funfacts";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface AppState {
  items: OrderItem[];
  orders: OrderAggregate[];
  returns: ReturnRecord[];
  returnRequests: ReturnRequest[];
  isDataLoaded: boolean;

  dateRange: DateRange;
  selectedCategories: ProductCategory[];
  searchQuery: string;

  activeView: ViewId;
  isImporting: boolean;
  importProgress: number;
  importError: string | null;
}

export type AppAction =
  | { type: "IMPORT_START" }
  | { type: "IMPORT_PROGRESS"; progress: number }
  | {
      type: "IMPORT_COMPLETE";
      items: OrderItem[];
      orders: OrderAggregate[];
      returns: ReturnRecord[];
      returnRequests: ReturnRequest[];
    }
  | { type: "IMPORT_ERROR"; error: string }
  | { type: "SET_DATE_RANGE"; range: DateRange }
  | { type: "SET_CATEGORIES"; categories: ProductCategory[] }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_VIEW"; view: ViewId }
  | { type: "CLEAR_DATA" };
