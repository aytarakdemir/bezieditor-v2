
import {Node, NodeType} from './node';

export class Scene {

    private canvas: HTMLCanvasElement;
    private ctx;

    private pivotX: number = 0;
    private pivotY: number = 0;

    private isEditing = false;


    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
        this.ctx = (this.canvas as HTMLCanvasElement).getContext('2d')!;
        this.animate();
        this.initControlMenuEvents();
    }

    private resizeCanvas = (): void => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
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

    public draw(): void {
        const node1 = new Node(5, 10, NodeType.regular);
        node1.draw(this.ctx);
        const node2 = new Node(5, 10, NodeType.controlStart);
        node2.draw(this.ctx);
        const node3 = new Node(5, 10, NodeType.controlEnd);
        node3.draw(this.ctx);
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

