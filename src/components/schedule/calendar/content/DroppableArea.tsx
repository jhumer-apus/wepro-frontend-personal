import { useDroppable } from "@dnd-kit/core";
import { PropsWithChildren } from "react";

interface Props {
    id: string;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function DroppableArea(props: PropsWithChildren<Props>) {
    const { id, children, className = "", onClick } = props;

    const { isOver, setNodeRef } = useDroppable({
        id,
        data: {
            type: "timeslot",
            accepts: ["job"],
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`droppable-area ${className} transition-colors duration-200 ${
                isOver
                ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-300"
                : ""
            }`}
            onClick={onClick}
            data-droppable-id={id}
        >
            {children}
        </div>
    );
}
