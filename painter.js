window.onload = function() {
    var canvas = document.getElementById("background");
    setupCanvas(canvas);             
};

function setupCanvas(canvas) {
    let width = window.innerWidth;
    let height = window.innerHeight;

    var ctx = canvas.getContext("2d");            
    ctx.canvas.width  = width;
    ctx.canvas.height = height;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";

    canvas.addEventListener(
        "mousemove",
        function onMouseover(e) {
            var mx = e.clientX - 8;
            var my = e.clientY - 8;                             
            ctx.beginPath();
            ctx.moveTo(0, my);
            ctx.lineTo(width, my);
            ctx.stroke()               
        }
    );
}
