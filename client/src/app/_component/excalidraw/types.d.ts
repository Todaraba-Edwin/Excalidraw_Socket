// types : _component/excalidraw/DrawBody
enum pointerStateEnm { DOWN = 'down', UP = 'up'}
type pointerButtonType = Parameters<NonNullable<ExcalidrawTypes.ExcalidrawProps["onPointerUpdate"]>>[0]['button'];
type pointerPointerType = Parameters<NonNullable<ExcalidrawTypes.ExcalidrawProps["onPointerUpdate"]>>[0]['pointer'];
