

export class Scene {

    private canvas: HTMLCanvasElement;
    private ctx;

    private pivotX: number = 0;
    private pivotY: number = 0;


    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
        this.ctx = (this.canvas as HTMLCanvasElement).getContext('2d')!;
        this.animate();
    }

    private resizeCanvas= (): void => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }


    
    public draw(): void {
    }

    public setPivot(x: number, y: number): void {
        this.pivotX = x;
        this.pivotY = y;    
    }

    public setCoordinates(coords: number[][]) {
        console.log(coords);
    }

    
    private animate():void {
        this.ctx.clearRect(0, 0, innerWidth, innerHeight);
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }


}

