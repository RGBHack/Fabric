const pickr = Pickr.create({
    el: ".color-picker",
    theme: "classic", // or 'monolith', or 'nano'
    default: "#42445a",
    appClass: "custom-class",

    swatches: [
      "rgba(244, 67, 54, 1)",
      "rgba(233, 30, 99, 0.95)",
      "rgba(156, 39, 176, 0.9)",
      "rgba(103, 58, 183, 0.85)",
      "rgba(63, 81, 181, 0.8)",
      "rgba(33, 150, 243, 0.75)",
      "rgba(3, 169, 244, 0.7)",
      "rgba(0, 188, 212, 0.7)",
      "rgba(0, 150, 136, 0.75)",
      "rgba(76, 175, 80, 0.8)",
      "rgba(139, 195, 74, 0.85)",
      "rgba(205, 220, 57, 0.9)",
      "rgba(255, 235, 59, 0.95)",
      "rgba(255, 193, 7, 1)",
    ],

    components: {
      // Main components
      preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
        hex: true,
        rgba: true,
        hsla: true,
        hsva: true,
        cmyk: true,
        input: true,
        save: true,
      },
    },
  });
  (function () {
    var socket = io();
    var canvas = document.getElementsByClassName("whiteboard")[0];
    var colors = document.getElementsByClassName("color");
    var save = document.getElementsByClassName("pcr-save");
    var context = canvas.getContext("2d");

    var current = {
      color: "black",
    };
    var drawing = false;

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    //Touch support for mobile devices
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    for (var i = 0; i < colors.length; i++) {
      colors[i].addEventListener("click", onColorUpdate, false);
    }
    save[0].addEventListener("click", onColorUpdate, false);

    socket.on("drawing_{{ id }}", onDrawingEvent);

    window.addEventListener("resize", onResize, false);
    onResize();

    function drawLine(x0, y0, x1, y1, color, emit) {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();

      if (!emit) {
        return;
      }
      var w = canvas.width;
      var h = canvas.height;

      socket.emit("drawing_{{ id }}:{{ password }}", {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color,
      });
    }

    function onMouseDown(e) {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    }

    function onMouseUp(e) {
      if (!drawing) {
        return;
      }
      drawing = false;
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
    }

    function onMouseMove(e) {
      if (!drawing) {
        return;
      }
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    }

    function onColorUpdate(e) {
      current.color = pickr.getSelectedColor().toHEXA().toString();
    }

    // limit the number of events per second
    function throttle(callback, delay) {
      var previousCall = new Date().getTime();
      return function () {
        var time = new Date().getTime();

        if (time - previousCall >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    }

    function onDrawingEvent(data) {
      var w = canvas.width;
      var h = canvas.height;
      drawLine(
        data.x0 * w,
        data.y0 * h,
        data.x1 * w,
        data.y1 * h,
        data.color
      );
    }

    // make the canvas fill its parent
    function onResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    socket.on("clear_{{ id }}", () => {
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    });
    document.getElementById("clear-btn").onclick = () => {
      console.log("hi2");
      socket.emit("clear_{{ id }}:{{ password }}");
    };
    socket.emit("connecteda","{{ id }}")
  })();