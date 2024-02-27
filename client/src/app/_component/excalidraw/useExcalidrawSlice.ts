import { useAppDispatch } from "@/lib/hooks";
import { UserPonterType } from "@/lib/modules/excalidrawPointersSlice";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

export const useExcalidrawSlice = () => {
    const dispatch = useAppDispatch()
    const handleExcalidrawSelectDispatch = (action: (payload: any) 
    => any, {message}: {message : ExcalidrawElement | ExcalidrawElement[] | string[] | UserPonterType}) => {
    dispatch(action(message));
  };
  return { handleExcalidrawSelectDispatch }
}