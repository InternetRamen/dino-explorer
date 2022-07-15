const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const images = [];
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
let rows = 0;

(async () => {
    const dinos = await fetch("https://geta.dino.icu/dinos/all");
    const dinosJson = await dinos.json();
    const dinosArray = dinosJson.map((dino) => dino.url);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "black";
    ctx.fillText("Loading", 50, 50);
    for (let i = 0; i < dinosArray.length; i++) {
        let dino = dinosArray[i];
        await delay(5);
        const dinoImg = new Image();
        console.log(i, dino);
        dinoImg.src = dino;
        dinoImg.onload = () => {
            images.push(dinoImg);
        };
    }
    requestAnimationFrame(draw);
})();

const camera = { x: 0, y: 0 };
let zoom = 1;
let dragging = 0;
let dragStart = {
    camera: camera,
    mouse: { x: 0, y: 0 },
};
canvas.addEventListener("mousedown", (e) => {
    dragStart.camera = { ...camera };
    dragStart.mouse.x = e.pageX;
    dragStart.mouse.y = e.pageY;
    dragging = true;
    canvas.style.cursor = "grabbing";
});
canvas.addEventListener("mouseup", (e) => {
    dragging = false;
    canvas.style.cursor = "grab";
});
canvas.addEventListener("mousemove", (e) => {
    if (dragging) {
        camera.x = dragStart.camera.x + (e.pageX - dragStart.mouse.x);
        camera.y = dragStart.camera.y + (e.pageY - dragStart.mouse.y);
        if (camera.x > 0) {
            camera.x = 0;
        }
        if (camera.y > 0) {
            camera.y = 0;
        }
        if (camera.x - canvas.width < -256 * 20 * zoom) {
            camera.x = -256 * 20 * zoom + canvas.width;
        }
        if (camera.y - canvas.height < rows*-256*zoom) {
            camera.y = rows*-256*zoom + canvas.height;
        }

        console.log(camera, camera.x - canvas.width, canvas.height, zoom);
    }
});
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoom -= e.deltaY * 0.001;
    zoom = Math.max(zoom, 0.5);
    if (camera.x - canvas.width < -256 * 20 * zoom) {
        camera.x = -256 * 20 * zoom + canvas.width;
    }
    if (camera.y - canvas.height < -256 * 20 * zoom) {
        camera.y = -256 * 20 * zoom + canvas.height;
    }
});

function draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillText("uh " + zoom, 50, 50);

    let x = 0;
    let y = 0;
    let max = 0;
    rows = 1
    for (let image of images) {
        if (x + 256 > 256 * 20) {
            x = 0;
            y += max;
            max = 0;
            rows++
        }
        ctx.save();
        ctx.translate(camera.x, camera.y);
        ctx.scale(zoom, zoom);
        ctx.drawImage(image, x, y, 256, 256);
        ctx.restore();
        x += 256;
        max = Math.max(max, 256);
    }
    requestAnimationFrame(draw);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
