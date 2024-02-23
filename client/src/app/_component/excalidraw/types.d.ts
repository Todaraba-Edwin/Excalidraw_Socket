// types : _component/excalidraw/DrawBody
enum pointerStateEnm { DOWN = 'down', UP = 'up'}
type pointerStateType = Parameters<NonNullable<ExcalidrawTypes.ExcalidrawProps["onPointerUpdate"]>>[0]['button'];
