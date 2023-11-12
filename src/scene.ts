
import {Node, NodeType} from './node';

export class Scene {

    private canvas: HTMLCanvasElement;
    private ctx;

    private pivotX: number = 0;
    private pivotY: number = 0;

    private isEditing = false;

    private nodes: Node[] = [
        new Node(10, 10, NodeType.regular),
        new Node(20, 10, NodeType.controlStart),
        new Node(30, 10, NodeType.controlEnd)
    ];
    private isDragging: boolean = false;
    private selectedNodes: Set<Node> = new Set();

    private firstSelectedNode: Node | null = null;


    private dragOffset: { x: number, y: number } = { x: 0, y: 0 };

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
        this.ctx = (this.canvas as HTMLCanvasElement).getContext('2d')!;
        this.animate();
        this.initControlMenuEvents();
        this.initMouseEvents();
    }

    private resizeCanvas = (): void => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private initMouseEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    }



    private onMouseDown(event: MouseEvent) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        let nodeFound = false;
        let lastClickedNode: Node | null = null;
    
        this.nodes.forEach(node => {
            if (node.isPointInside(mouseX, mouseY)) {
                nodeFound = true;
                lastClickedNode = node;
    
                if (!event.shiftKey) {
                    // If Shift is not pressed, start a new selection
                    this.selectedNodes.clear();
                }
    
                this.selectedNodes.add(node);
            }
        });
    
        if (nodeFound && lastClickedNode) {
            // Recalculate dragOffset for all selected nodes based on the last clicked node
            this.selectedNodes.forEach(node => {
                node.dragOffset.x = mouseX - node.getCoords().x;
                node.dragOffset.y = mouseY - node.getCoords().y;
            });
        }
    
        if (!nodeFound && !event.shiftKey) {
            this.selectedNodes.clear();
        }
    
        this.isDragging = nodeFound;
    }
                                    
    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
    
        const mouseX = event.clientX;
        const mouseY = event.clientY;
    
        this.selectedNodes.forEach(node => {
            // Apply the drag offset to calculate the new position
            const newX = mouseX - node.dragOffset.x;
            const newY = mouseY - node.dragOffset.y;
    
            node.update(newX, newY);
        });
    }
                        
    private onMouseUp(event: MouseEvent) {
        // Stop dragging
        this.isDragging = false;

        if (!event.shiftKey) {
            // If Shift is not pressed, start a new selection
            this.selectedNodes.clear();
        }
    }

    private initControlMenuEvents() {
        const checkBox = document.getElementById('edit-state') as HTMLInputElement;
        const button = document.getElementById('btn-input') as HTMLButtonElement;
        const textarea = document.getElementById('bezier-input') as HTMLTextAreaElement;
        const outputButton = document.getElementById('btn-output') as HTMLButtonElement;
        const outputParagraph = document.getElementById('output') as HTMLParagraphElement;

        checkBox.checked = this.isEditing;
        checkBox.addEventListener('change', () => {
            if (checkBox.checked) {
                this.isEditing = true;
            } else {
                this.isEditing = false;
            }
        });
        button.addEventListener('click', () => {
            try {
                const inputValue = JSON.parse(textarea.value) as number[][];
                if (this.isValidNumberArrayArray(inputValue)) {
                    this.processInput(inputValue);
                } else {
                    alert('Invalid input format. Expected an array of arrays of numbers.');
                    console.error('Invalid input format. Expected an array of arrays of numbers.');
                }
            } catch (error) {
                alert('Invalid input format. Expected an array of arrays of numbers.');
                console.error('Invalid JSON format:', error);
            }
        });
        // outputButton.addEventListener('click', () => {
        //     const formattedArrayString = '[' + this.bezierCoordinates.map(subArray => 
        //         '\n[' + subArray.join(', ') + ']'
        //     ).join(',') + '\n]';            
        //     outputParagraph.textContent = formattedArrayString;
        // });
    }

    private processInput(inputValue: number[][]) {
        console.log('Validated input:', inputValue);

        // this.bezierCoordinates=inputValue;
    }

    private isValidNumberArrayArray(input: any): input is number[][] {
        return Array.isArray(input) &&
            input.every(subArray =>
                Array.isArray(subArray) &&
                subArray.every(item => typeof item === 'number')
            );
    }

    private isNodeSelected(node: Node): boolean {
        return this.selectedNodes.has(node);
    }

    public draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const node of this.nodes) {
            const isSelected = this.isNodeSelected(node);
            node.draw(this.ctx, isSelected); 
        }

    }

    public setPivot(x: number, y: number): void {
        this.pivotX = x;
        this.pivotY = y;
    }

    public setCoordinates(coords: number[][]) {
        console.log(coords);
    }


    private animate(): void {
        this.ctx.clearRect(0, 0, innerWidth, innerHeight);
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }


}

