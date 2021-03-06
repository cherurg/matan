var func_num = 0; // текущая функция из списка
var prev_func = 0; // предыдущая выбранная функция
var xpos = 0; // текущая координата

var stop_checker = false; // была ли нажата кнопка паузы
var was_stopped = false; // была ли остановка (для движения анимации из предыдущей точки)
var animation_started = false; // была ли начата анимация
var slow_motion_checker = 0; // должно ли быть замедление движения (вблизи особых точек)
var animation_speed = 30; // скорость показа кадров анимации (в милисекундах)

var width_global = 700; // значения по умолчанию
var height_global = 700;

function func(x) { 
	if (func_num == 0)  {
		return (Math.sin(x)).toPrecision(3);
	}  else if (func_num == 1) {
		return 1/(5*x);
	} else if (func_num == 2) {
		return x*x/1.5;
	} else if (func_num == 3) {
		return (Math.sin(x)/x).toPrecision(3);
	} else if (func_num == 4) {
		return 1.7*Math.log(x + 0.05);
	} else if (func_num == 5) {
		return x;
	}
}

// АНИМАЦИЯ | ANIMATION

function makeAnimation(form) {
	animation_started = true;
	if (animation_started == true) {
		if (func_num == 2 || func_num == 5) {
			var timer = setInterval(drawAnimation, animation_speed);
		} else {
			var timer = setInterval(drawAnimation, animation_speed + 5);
		}
	}
	if (!was_stopped) {
	if (func_num == 5 || func_num == 3) { // начальная точка анимации для функций
		xpos = width_global/2 - 100;
	} else if (func_num == 4) {
		xpos = width_global/2;
	} else if (func_num == 0) {
		xpos = width_global/2 - 200;
	} else if (func_num == 2) {
		xpos = 1;
	} else if (func_num == 1) {
		xpos = width_global/2 - 100;
	}
}

was_stopped = false;

function drawAnimation() {

	incr_fast = 0.9;
	incr = 0.5;
	if (func_num == 4) {
		incr_fast = -2.5;
		if (Math.abs(xpos) < 150) {
			incr_fast = -1;
		}
		incr = -0.55;
	}
    if (func_num == 4) { // замедление анимации около особых точек (логарифм)
    	if (Math.abs(xpos) < 40) {
    		if (slow_motion_checker > 1) {
    			xpos = xpos + incr;
    			redrawCanvas();
    			slow_motion_checker = 0;
    		} else {
    			redrawCanvas();
    			slow_motion_checker++;
    		}
    	} else {
    		xpos = xpos + incr_fast;
    		redrawCanvas();
    	}
    } else if (func_num == 1) {
    	if (Math.abs(xpos - width_global/2) < 40) {
    		if (slow_motion_checker > 1) {
    			xpos = xpos + incr;
    			redrawCanvas();
    			slow_motion_checker = 0;
    		} else {
    			redrawCanvas();
    			slow_motion_checker++;
    		}
    	} else {
    		xpos = xpos + incr_fast;
    		redrawCanvas();
    	}
    } else {
    	xpos = xpos + incr_fast;
    	redrawCanvas();
    }
    if (xpos == width_global || stop_checker == true) {
    	clearInterval(timer);
    }
}
animation_started = false;
}

function controlAnimation(form) {
	if (stop_checker == false) { // если нажали паузу
		stop_checker = true;
		was_stopped = false;
	} else { // если нажали пуск
		was_stopped = true;
		stop_checker = false;
		animation_started = false;
		makeAnimation(form);
	}
	var elem = document.getElementById("controlButton");
	if (elem.value == " Пуск ") {
		elem.value = " Пауза ";
	} else {
		elem.value = " Пуск ";
	}
}

// ГРАФИКА | GRAPHICS

function redrawCanvas() {
	if (document.getElementById('sine').checked)  {
		prev_func = func_num;
		func_num = 0;
		if (func_num != prev_func) {
			xpos = width_global/2 - 200;
		}
		draw();
	}  else if (document.getElementById('hyp').checked) {
		prev_func = func_num;
		func_num = 1;
		if (func_num != prev_func) {
			xpos = width_global/2 - 100;
		}
		draw();
	} else if (document.getElementById('para').checked) {
		prev_func = func_num;
		func_num = 2;
		if (func_num != prev_func) {
			xpos = 1;
		}
		draw();
	} else if (document.getElementById('sinefrac').checked) {
		prev_func = func_num;
		func_num = 3;
		if (func_num != prev_func) {
			xpos = width_global/2 - 100;
		}
		draw();
	} else if (document.getElementById('log').checked) {
		prev_func = func_num;
		func_num = 4;
		if (func_num != prev_func) {
			xpos = width_global/2;
		}
		draw();
	} else if (document.getElementById('linear').checked) {
		prev_func = func_num;
		func_num = 5;
		if (func_num != prev_func) {
			xpos = width_global/2 - 100;
		}
		draw();
	}
}

function draw() {
	var canvas = document.getElementById("canvas");
	var axes = {};
	var context = canvas.getContext("2d");

	context.canvas.width  = window.innerWidth*0.5;
	context.canvas.height = window.innerHeight*0.8;

	width_global = context.canvas.width;
	height_global = context.canvas.height;
 if (!context.setLineDash) { // если не поддерживается стиль линий
 	context.setLineDash = function () {}
 }
 
 context.clearRect(0, 0, canvas.width, canvas.height); // удаление ранее нарисованного
 
 if (func_num == 2 || func_num == 4) {
 	axes.x0 = 0.5; // координаты центра
 	if (func_num == 4) {
 		axes.y0 = 0.5 + 0.5*canvas.height;
 	} else {
 		axes.y0 = 0.5 + 0.9*canvas.height;
 	}
 } else {
	axes.x0 = 0.5 + 0.5*canvas.width; // координаты центра
	axes.y0 = 0.5 + 0.5*canvas.height;
}

 axes.scale = 80; // коэффициент масштабирования
 axes.doNegativeX = true; // отрицательные координаты
 
 var xx, yy;
 var dx = 4; // шаг по сетке
 var x0 = axes.x0, y0 = axes.y0; // координаты центра
 var scale = axes.scale; // масштаб
 
 drawAxes(context, axes); // отрисовка осей
 drawAreas(context, axes, "rgb(0, 191, 255)", xpos, x0, y0, scale);
 drawGraph(context, axes, "rgb(0, 191, 255)", 1, xpos, xx, yy, dx, x0, y0, scale); // отрисовка графика и окрестностей

}

function drawAxes(context, axes) {

	var x0 = axes.x0;
	var width = context.canvas.width;
	var y0 = axes.y0;
	var height = context.canvas.height;
	var xmin = axes.doNegativeX ? 0 : x0;

	context.beginPath();
	context.setLineDash([1, 0]);
	context.strokeStyle = "#000000"; 
	context.moveTo(xmin, y0);
	context.lineTo(width, y0);
	context.moveTo(x0, 0);
	context.lineTo(x0, height);
	context.stroke();
	context.closePath();

 // подписываем оси
 context.beginPath();
 context.strokeStyle = "#000000";
 context.font = "bold 12px sans-serif";
 context.fillText("x", canvas.width - 10, axes.y0 - 5);
 context.fillText("y", axes.x0 + 10, 10);
 context.closePath();
}

function drawGraph (context, axes, color, thick, xpos, xx, yy, dx, x0, y0, scale) {

 var end = Math.round((context.canvas.width - x0)/dx); // конец промежутка отрисовки
 var start = axes.doNegativeX ? Math.round(-x0/dx) : 0; // начало промежутка отрисовки
 // рисуем график
 context.beginPath();
 context.lineWidth = thick;
 context.strokeStyle = color;
 context.setLineDash([1, 0]);

 for (var i = start; i <= end; i++) {
 	xx = dx*i;
 	yy = scale*func(xx/scale);
 	if (i == start) {
 		context.moveTo(x0 + xx, y0 - yy);
 	} else {
 		context.lineTo(x0 + xx, y0 - yy);
 	}
 }
 
 context.stroke();
 context.closePath();

}

function drawAreas (context, axes, color, xpos, x0, y0, scale) {

	if (func_num == 0 && xpos == 0) {
		xpos = width_global/2 - 200;
	}
	var delta_area = xpos + 10;
	if (func_num == 2) {
		delta_area = xpos + 25;
	} else if (func_num == 4) {
		delta_area = xpos + 20;
	}

	var density_mult = 15;
	var step = 0;
	
if (func_num == 2) { // множитель, учитывающий возможный размах значений функции
	density_mult = 60;
} else if (func_num == 0) {
	density_mult = 4;
} else if (func_num == 3) {
	density_mult = 0.7;
} else if (func_num == 4) {
	density_mult = 10;
} else if (func_num == 1) {
	density_mult = 1/3;
}

	// рисуем дельта-окрестность
	context.beginPath();
	context.setLineDash([1, 3]);
	for (var i = xpos; i <= delta_area; i = i + 1) {
		context.moveTo(i, y0 - scale*func((i - x0)/scale));
		context.lineTo(i, y0);
	}
	context.strokeStyle = color;
	context.stroke();
	context.closePath();

	// рисуем эпсилон-окрестность
	
	if  (func_num == 1 || func_num == 4) { 

		if (delta_area > x0 - width_global*0.001)
		{
			if (func_num == 1) {
				step = 1/40;
			} else {
				step = 1/30;
			}
		}
		
		if (delta_area > x0 - width_global*0.05)
		{
			if (func_num == 1) {
				step = 1/15;
			} else {
				step = 1/5;
			}
		}
		
		if (delta_area > x0 + width_global*0.05 || delta_area <= x0 - width_global*0.05)
		{
			step = density_mult/((Math.abs(scale*func((xpos - x0)/scale) - scale*func((delta_area - x0)/scale))));
			// разница между значениями функциями в краях дельта-окрестности определяет плотность закраски - количество прямых, которыми рисуется окрестность
		}
	} else if (func != 0) {
		step = density_mult/((Math.abs(scale*func((xpos - x0)/scale) - scale*func((delta_area - x0)/scale))));
	}
	
	context.beginPath();
	for (var i = xpos; i <= delta_area; i = i + step) {
		context.moveTo(i, y0 - scale*func((i - x0)/scale));
		context.lineTo(x0, y0 - scale*func((i - x0)/scale));
	}
	context.setLineDash([1, 1]);
	context.strokeStyle = "#EE4000";
	context.stroke();
	context.closePath();

	// подписываем точки
	context.beginPath();
	context.fillStyle = "#8B7765";
	context.font = "bold 10px sans-serif";
	context.fillText("[", xpos, y0 - 5);
	context.fillText("δ", (delta_area + xpos)/2 - 2, y0 - 5);
	context.fillText("]", delta_area, y0 - 5);
	context.closePath();

	// рисуем перпендикуляры к осям
	context.beginPath();
	context.moveTo(delta_area, y0 - scale*func((delta_area - x0)/scale));
	context.lineTo(x0, y0 - scale*func((delta_area - x0)/scale));
	context.moveTo(xpos, y0 - scale*func((xpos - x0)/scale));
	context.lineTo(x0, y0 - scale*func((xpos - x0)/scale));
	context.setLineDash([2, 2]);
	context.strokeStyle = "rgb(255, 128, 0)";
	context.stroke();
	context.closePath();
}