import { useDraggable } from "@dnd-kit/core";
import { PropsWithChildren } from "react";

interface Props {
    className?: string;
    job: any;
}
export default function DraggableJob({ className, children, job }: PropsWithChildren<Props>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({ id: job.id });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-opacity`}
        >
            {children}
        </div>
    );
}