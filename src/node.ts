
export enum NodeType {
    regular,
    controlStart,
    controlEnd,
}

export class Node {
    public dragOffset = { x: 0, y: 0 };
    constructor(private x: number, private y: number, private type: NodeType = NodeType.regular) {
    }

    // Move the node to a new position
    update(newX: number, newY: number): void {
        this.x = newX;
        this.y = newY;
    }

    getCoords(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    getType() : NodeType {
        return this.type;
    }

    isPointInside(x: number, y: number): boolean {
        const radius = 5; // Assuming the node is drawn as a circle with radius 5
        const dx = x - this.x;
        const dy = y - this.y;
        return dx * dx + dy * dy <= radius * radius;
    }

    // Render the node on the canvas as a point
    draw(ctx: CanvasRenderingContext2D): void {
        switch (this.type) {
            case NodeType.regular:
                ctx.fillStyle = "yellow";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(this.x - 5, this.y - 5, 10, 10);
                ctx.fill();
                ctx.stroke();        
                break;
            case NodeType.controlStart:
                ctx.lineWidth = 1;
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();        
                break;
            case NodeType.controlEnd:
                ctx.lineWidth = 1;
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.ellipse(this.x , this.y , 5, 5, Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();        
                break;
        }
    }
}
