import '../styles.css';
import {Scene} from './scene';
import interact from 'interactjs';

const scene = new Scene(500, 500);

document.addEventListener('DOMContentLoaded', (event) => {
    const dropArea = document.getElementById('image-tray');

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Add keydown event listener to document
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Delete all images
            removeAllImages();
        }
    });

    function handleFiles(files: any) {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.classList.add('resizable-image');
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    URL.revokeObjectURL(img.src); // Free memory
                };
                dropArea.appendChild(img);

                // Initialize interact.js on the image
                initInteract(img);
            }
        }
    }


    function removeAllImages() {
        // Remove all child elements (images) from the drop area
        while (dropArea.firstChild) {
            dropArea.removeChild(dropArea.firstChild);
        }
    }

    function initInteract(element: any) {
        // Enable drag
        interact(element).draggable({
            listeners: { move: dragMoveListener }
        });
    
        // Enable resize
        interact(element).resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: { move: resizeMoveListener },
            modifiers: [
                interact.modifiers.restrictSize({ min: { width: 100, height: 100 } })
            ]
        });
    }
    

    function dragMoveListener(event: any) {
        const target = event.target;
        // Keep the dragged position in the data-x/data-y attributes
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // Translate the element
        target.style.transform = `translate(${x}px, ${y}px)`;

        // Update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    function resizeMoveListener(event: any) {
        const target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.deltaRect.left;
        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;
    
        // Update the element's style
        if (event.ctrlKey) {
            // Preserve aspect ratio if Ctrl key is pressed
            const aspectRatio = target.offsetWidth / target.offsetHeight;
            if (event.rect.width / event.rect.height > aspectRatio) {
                event.rect.height = event.rect.width / aspectRatio;
            } else {
                event.rect.width = event.rect.height * aspectRatio;
            }
        }
    
        target.style.width = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';
    
        // Translate when resizing from top or left edges
        target.style.transform = `translate(${x}px, ${y}px)`;
    
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
});


scene.draw();
