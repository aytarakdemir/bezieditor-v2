
export enum NodeType {
    regular,
    controlStart,
    controlEnd,
    pivot
}

export class Node {
    public dragOffset = { x: 0, y: 0 };
    constructor(private x: number, private y: number, private type: NodeType = NodeType.regular, private pivotX = 0, private pivotY = 0) {
    }

    // Move the node to a new position
    update(newX: number, newY: number): void {
        this.x = newX;
        this.y = newY;
    }

    getCoords(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    getPivot(): { x: number, y: number } {
        return { x: this.pivotX, y: this.pivotY };
    }

    getType() : NodeType {
        return this.type;
    }

    isPointInside(x: number, y: number): boolean {
        const radius = 5; // Assuming the node is drawn as a circle with radius 5
        const dx = x - (this.pivotX + this.x);
        const dy = y - (this.pivotY + this.y);
        return dx * dx + dy * dy <= radius * radius;
    }

    setPivot(x: number, y: number) {
        this.pivotX = x;
        this.pivotY = y;
    }

    // Render the node on the canvas as a point
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isEditing: boolean = true): void {
        if (!isEditing) return;

        if (isSelected) {
            ctx.beginPath();
            ctx.moveTo(this.pivotX + this.x - 10, this.pivotY + this.y);
            ctx.lineTo(this.pivotX + this.x + 10, this.pivotY + this.y);
            ctx.moveTo(this.pivotX + this.x, this.pivotY + this.y - 10);
            ctx.lineTo(this.pivotX + this.x, this.pivotY + this.y + 10);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        switch (this.type) {
            case NodeType.regular:
                ctx.fillStyle = "yellow";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(this.pivotX + this.x - 5, this.pivotY + this.y - 5, 10, 10);
                ctx.fill();
                ctx.stroke();        
                break;
            case NodeType.pivot:
                ctx.fillStyle = "black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(this.pivotX + this.x - 5, this.pivotY + this.y - 5, 10, 10);
                ctx.fill();
                ctx.stroke();        
                break;
            case NodeType.controlStart:
                ctx.lineWidth = 1;
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.ellipse(this.pivotX + this.x, this.pivotY + this.y, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();        
                break;
            case NodeType.controlEnd:
                ctx.lineWidth = 1;
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.ellipse(this.pivotX + this.x , this.pivotY + this.y , 5, 5, Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();        
                break;
        }
    }
}
