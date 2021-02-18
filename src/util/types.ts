import { useSelector } from "react-redux";
import { RootState } from "../store/reducers/RootReducer";

export function useKState<T>(selector: (s: RootState) => T): T {
  return useSelector(selector);
}
