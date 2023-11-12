import '../styles.css';
import {Scene} from './scene';

const scene = new Scene();

scene.setPivot(300,0);

scene.setCoordinates(
    [
        [476, 47],
        [350, 17, 374, 166, 254, 90],
        [203, 145, 335, 136, 272, 184],
        [116, 195, 292, 334, 143, 371],
        [289, 597, 350, 275, 575, 441]
        ]
);

scene.draw();
