
import {Node, NodeType} from './node';

export class Scene {

    private canvas: HTMLCanvasElement;
    private ctx;



    private isEditing = true;


    private nodes: Node[] = [
        new Node(0, 0, NodeType.pivot, 0, 0)
    ];
    private isDragging: boolean = false;
    private selectedNodes: Set<Node> = new Set();

    private firstSelectedNode: Node | null = null;


    private minCoords: Node[] = [];
    private maxCoords: Node[] = [];



    private dragOffset: { x: number, y: number } = { x: 0, y: 0 };

    constructor(private pivotX = 0, private pivotY = 0) {
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
    
        this.nodes.slice().reverse().forEach(node => {
            if (node.isPointInside(mouseX, mouseY)) {
                nodeFound = true;

                if (event.shiftKey) {
                    // Toggle selection with Shift key
                    if (this.selectedNodes.has(node)) {
                        this.selectedNodes.delete(node); // Deselect if already selected
                    } else {
                        this.selectedNodes.add(node); // Select if not already selected
                    }
                    // Prevent dragging when Shift key is pressed
                    this.isDragging = false;
                } else {
                    if (!this.selectedNodes.has(node)) {
                        // Start a new selection if the clicked node is not already selected
                        this.selectedNodes.clear();
                        this.selectedNodes.add(node);
                    }
                    // Allow dragging when Shift key is not pressed
                    this.isDragging = true;
    
                    // Recalculate dragOffset for all selected nodes
                    this.selectedNodes.forEach(selectedNode => {
                        selectedNode.dragOffset.x = mouseX - selectedNode.getCoords().x + this.nodes[0].getCoords().x;
                        selectedNode.dragOffset.y = mouseY - selectedNode.getCoords().y + this.nodes[0].getCoords().y;
                    });
                }
            }
        });
    
        if (!nodeFound) {
            // If no node is found and Shift is not pressed, clear the selection
            if (!event.shiftKey) {
                this.selectedNodes.clear();
            }
            this.isDragging = false;
        }
    }
    
    
    
    
                                    
    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
    
        const mouseX = event.clientX;
        const mouseY = event.clientY;
    
        this.selectedNodes.forEach(node => {
            // Apply the drag offset to calculate the new position
            const newX = mouseX - node.dragOffset.x;
            const newY = mouseY - node.dragOffset.y;
    
            if (node.getType() === NodeType.pivot) {
                node.update(mouseX, mouseY);
                this.nodes.forEach(element => {
                    if (element.getType() !== NodeType.pivot) {
                        element.setPivot(mouseX, mouseY);
                    }
                });

            }
            else
                node.update(newX + this.nodes[0].getCoords().x, newY + this.nodes[0].getCoords().y);
        });
    }
    
    
                        
    private onMouseUp(event: MouseEvent) {
        // Stop dragging
        this.isDragging = false;

    }

    private selectAllNodes() {
        this.selectedNodes.clear();
        this.nodes.forEach(node => {
            if (node.getType() !== NodeType.pivot) {
                this.selectedNodes.add(node);
            }
        })
    }

    private initControlMenuEvents() {
        const checkBox = document.getElementById('edit-state') as HTMLInputElement;
        const button = document.getElementById('btn-input') as HTMLButtonElement;
        const buttonSelectAll = document.getElementById('btn-select-all') as HTMLButtonElement;
        const textarea = document.getElementById('bezier-input') as HTMLTextAreaElement;
        const outputButton = document.getElementById('btn-output') as HTMLButtonElement;
        const outputParagraph = document.getElementById('output') as HTMLParagraphElement;
        const minCoordsButton = document.getElementById('btn-min-coords') as HTMLButtonElement;
        const outputMinParagraph = document.getElementById('output-min-coords') as HTMLParagraphElement;
        const maxCoordsButton = document.getElementById('btn-max-coords') as HTMLButtonElement;
        const outputMaxParagraph = document.getElementById('output-max-coords') as HTMLParagraphElement;
        const buttonProduceModifiers = document.getElementById('btn-produce-modifiers') as HTMLButtonElement;
        const outputProduceModifiers = document.getElementById('output-produce-modifiers') as HTMLParagraphElement;

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

        buttonSelectAll.addEventListener('click', () => {
            this.selectAllNodes();
        });

        outputButton.addEventListener('click', () => {
            outputParagraph.textContent = this.formatForOutput(this.nodes);
        });

        minCoordsButton.addEventListener('click', () => {
            const [, ...minArray] = this.nodes;
            this.minCoords = this.cloneNodeArray(minArray);
            outputMinParagraph.textContent = this.formatForOutput(this.minCoords);
        });

        maxCoordsButton.addEventListener('click', () => {
            const [, ...maxArray] = this.nodes;
            this.maxCoords = this.cloneNodeArray(maxArray);
            outputMaxParagraph.textContent = this.formatForOutput(this.maxCoords);
        });

        buttonProduceModifiers.addEventListener('click', () => {
            outputProduceModifiers.textContent = this.produceModifiers(this.minCoords, this.maxCoords);
        })

    }

    private cloneNodeArray(nodeArray: Node[]): Node[] {
        return nodeArray.map(node => {
            const coords = node.getCoords();
            const pivot = node.getPivot();
            // Create a new Node with the same properties
            const clonedNode = new Node(coords.x, coords.y, node.getType(), pivot.x, pivot.y);
            // Assuming dragOffset should also be copied
            clonedNode.dragOffset = { ...node.dragOffset };
            return clonedNode;
        });
    }

    private formatForOutput(nodeArr: Node[]) {
        let output:any = [];
        let currentSet: any = [];
        let previousType: NodeType = NodeType.regular 

        nodeArr.forEach((node, index) => {

            if (!(node.getType() === NodeType.pivot)) {
                
                
                if ((previousType === NodeType.regular || previousType === NodeType.pivot) && node.getType() === NodeType.regular) {
                    currentSet.push(node.getCoords().x, node.getCoords().y);
                    output.push(currentSet);
                    currentSet = [];                   
                } else {
                    currentSet.push(node.getCoords().x, node.getCoords().y);
                    
                    if (node.getType() === NodeType.regular) {
                        output.push(currentSet);
                        currentSet = [];                   
                        
                    }
                }
            } 
            previousType = node.getType(); 

        });

        const formattedArrayString = '[' + output.map((subArray:any) => 
            '\n[' + subArray.join(', ') + ']'
        ).join(',') + '\n]';  

        return formattedArrayString;
    }

    private produceModifiers(minCoords: Node[], maxCoords: Node[]): string {
        if (minCoords.length === 0 || maxCoords.length === 0  || this.minCoords.length !== this.maxCoords.length)
            return 'Invalid inputs';

        console.log(minCoords);
        console.log(maxCoords);
        const averageNodeArray = this.calculateAverageNodeArray(minCoords, maxCoords);
        return this.formatForOutput(averageNodeArray);
    }


    private calculateAverageNodeArray(array1: Node[], array2: Node[]) {
        if (array1.length !== array2.length) {
            throw new Error('Arrays must be of the same length');
        }
    
        return array1.map((node1, index) => {
            const node2 = array2[index];
            
            // Calculate average values for coordinates and pivot
            const avgX = (node1.getCoords().x + node2.getCoords().x) / 2;
            const avgY = (node1.getCoords().y + node2.getCoords().y) / 2;
            const avgPivotX = (node1.getPivot().x + node2.getPivot().x) / 2;
            const avgPivotY = (node1.getPivot().y + node2.getPivot().y) / 2;
    
            // Create a new node with the averaged values, and default dragOffset
            const newNode = new Node(avgX, avgY, node1.getType(), avgPivotX, avgPivotY);
    
            return newNode;
        });
    }


    

    private processInput(inputValue: number[][]) {
        console.log('Validated input:', inputValue);
        this.nodes = [];
        this.nodes.push(new Node(this.pivotX, this.pivotY, NodeType.pivot, 0, 0));
        inputValue.forEach((curve: number[]) => {
            if (curve.length === 6) {
                this.nodes.push(new Node(curve[0], curve[1], NodeType.controlStart, this.nodes[0].getCoords().x, this.nodes[0].getCoords().y));
                this.nodes.push(new Node(curve[2], curve[3], NodeType.controlEnd, this.nodes[0].getCoords().x, this.nodes[0].getCoords().y));
                this.nodes.push(new Node(curve[4], curve[5], NodeType.regular, this.nodes[0].getCoords().x, this.nodes[0].getCoords().y));
            } else if (curve.length === 2) {
                this.nodes.push(new Node(curve[0], curve[1], NodeType.regular, this.nodes[0].getCoords().x, this.nodes[0].getCoords().y));
            } else {
                throw Error('Invalid number list length');
            }
        })

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
        this.ctx.fillStyle = "#ffceb4";
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'black';


        this.ctx.beginPath();
        this.ctx.moveTo(this.nodes[0].getCoords().x, this.nodes[0].getCoords().y);

        let output:any = [];
        let currentSet: any = [];
        let previousType: NodeType = NodeType.regular 
        this.nodes.forEach((node, index) => {
            
            if ((previousType === NodeType.regular || previousType === NodeType.pivot) && node.getType() === NodeType.regular) {
                currentSet.push(node.getCoords().x, node.getCoords().y);
                this.ctx.moveTo(this.nodes[0].getCoords().x + node.getCoords().x, this.nodes[0].getCoords().y + node.getCoords().y);
                output.push(currentSet);
                currentSet = [];                   
            } else {
                currentSet.push([node.getCoords().x, node.getCoords().y]);
                if (node.getType() === NodeType.regular) {
                    this.ctx.bezierCurveTo(this.nodes[0].getCoords().x + currentSet[0][0], this.nodes[0].getCoords().y + currentSet[0][1], this.nodes[0].getCoords().x + currentSet[1][0], this.nodes[0].getCoords().y + currentSet[1][1], this.nodes[0].getCoords().x + currentSet[2][0], this.nodes[0].getCoords().y + currentSet[2][1]);
                    output.push(currentSet);
                    currentSet = [];                   
                }
            }
            previousType = node.getType(); 

        });

        this.ctx.fill();
        this.ctx.stroke();



        for (const node of this.nodes) {
            const isSelected = this.isNodeSelected(node);
            node.draw(this.ctx, isSelected, this.isEditing); 
        }
        const isSelected = this.isNodeSelected(this.nodes[0]);
        this.nodes[0].draw(this.ctx, isSelected, this.isEditing);
        
    }





    private animate(): void {
        this.ctx.clearRect(0, 0, innerWidth, innerHeight);
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }


}

