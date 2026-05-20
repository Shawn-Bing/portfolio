"use client";

import { ReactNode } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface DragDropProviderProps {
  children: ReactNode[];
  onReorder: (sourceIndex: number, destIndex: number) => void;
  renderItem: (child: ReactNode, index: number) => ReactNode;
}

export default function DragDropProvider({
  children,
  onReorder,
  renderItem,
}: DragDropProviderProps) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="gallery-grid" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 p-4 md:p-6 w-full max-w-7xl mx-auto ${
              snapshot.isDraggingOver ? "bg-white/5 rounded-xl" : ""
            }`}
          >
            {children.map((child, index) => (
              <Draggable
                key={`draggable-${index}`}
                draggableId={`draggable-${index}`}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={
                      snapshot.isDragging ? "opacity-80 scale-105 z-50" : ""
                    }
                  >
                    {renderItem(child, index)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
