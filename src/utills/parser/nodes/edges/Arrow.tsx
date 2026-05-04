import React, { RefObject } from "react";

type ArrowProps = {
    fromRef: RefObject<HTMLDivElement | null>;
    toRef: RefObject<HTMLDivElement | null>;
};

const Arrow: React.FC<ArrowProps> = ({ fromRef, toRef }) => {
    const [coords, setCoords] = React.useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

    React.useEffect(() => {
        if (fromRef.current && toRef.current) {
            const fromBox = fromRef.current.getBoundingClientRect();
            const toBox = toRef.current.getBoundingClientRect();

            setCoords({
                x1: fromBox.x + fromBox.width / 2,
                y1: fromBox.y + fromBox.height,
                x2: toBox.x + toBox.width / 2,
                y2: toBox.y,
            });
        }
    }, [fromRef, toRef]);

    if (!coords) return null;

    return (
        <svg
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
            }}
        >
            <line
                x1={coords.x1}
                y1={coords.y1}
                x2={coords.x2}
                y2={coords.y2}
                stroke="white"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
            />
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                >
                </marker>
            </defs>
        </svg>
    );
};

export default Arrow;
