      (function () {
        var socket = io();
        var canvas = document.getElementsByClassName("whiteboard")[0];
        var colors = document.getElementsByClassName("color");
        var context = canvas.getContext("2d");

        var current = {
          color: "black",
        };
        var drawing = false;

        for (var i = 0; i < colors.length; i++) {
          colors[i].addEventListener("click", onColorUpdate, false);
        }

        socket.on("drawing_{{ id }}", onDrawingEvent);

        window.addEventListener("resize", onResize, false);
        onResize();

        function drawLine(x0, y0, x1, y1, color) {
          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.stroke();
          context.closePath();
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

        function clear() {
          socket.emit("clear");
        }
        socket.emit("connecteda","{{ id }}")
      })();