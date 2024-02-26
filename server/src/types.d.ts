export type JOIN_ROOM = string;
export type ROUNDNESS = {
  LEGACY: 1;
  PROPORTIONAL_RADIUS: 2;
  ADAPTIVE_RADIUS: 3;
};

export type ExcalidrawElement = {
  id: string;
  x: number;
  y: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: "hachure" | "cross-hatch" | "solid" | "zigzag";
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  roundness: null | {
    type: keyof ROUNDNESS;
    value?: number;
  };
  roughness: number;
  opacity: number;
  width: number;
  height: number;
  angle: number;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  groupIds: string[];
  frameId: string | null;
  boundElements: {
    id: ExcalidrawElement["id"];
    type: "arrow" | "text";
  } | null;
  updated: number;
  link: string | null;
  locked: boolean;

  type: string;
  lastCommittedPoint: number[] | null;
  startArrowhead: "arrow" | "bar" | "dot" | "triangle" | null;
  endArrowhead: "arrow" | "bar" | "dot" | "triangle" | null;
  startBinding: {
    elementId: ExcalidrawElement["id"];
    focus: number;
    gap: number;
  } | null;
  endBinding: {
    elementId: ExcalidrawElement["id"];
    focus: number;
    gap: number;
  } | null;
  points: number[][];
};

// {}
export type MESSAGE_ExcalidrawElement = {
  room: JOIN_ROOM;
  message: ExcalidrawElement;
  // STREAM_MESSAGE
};

// {}[]
export type MESSAGE_ExcalidrawElement_Arr = {
  room: JOIN_ROOM;
  message: ExcalidrawElement[];
};

export type STREAM_MESSAGE = {
  room: JOIN_ROOM;
  message: ExcalidrawElement;
};
export type STREAM_MOVE_MESSAGE = {
  room: JOIN_ROOM;
  message: ExcalidrawElement[];
};

// {}
export type ADD_MESSAGE = {
  room: JOIN_ROOM;
  message: ExcalidrawElement;
};

// ['id', 'id','id','id']
export type REMOVE_MESSAGE = {
  room: JOIN_ROOM;
  message: string[];
};

// {}[]
export type MOVE_MESSAGE = {
  room: JOIN_ROOM;
  message: ExcalidrawElement[];
};

export type RESET_MESSAGE = {
  room: JOIN_ROOM;
  message: any;
};
