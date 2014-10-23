(function (id) {
    var current = 0;
    var time;
	var button = new app.Controls("Controls");
    button.addButton(function () {    	
    	a[current]();
    }, "Рисовать"); 
    var animated = 0;
    var checkbox_1 = new app.Controls("Controls");
    checkbox_1.addCheckbox(function () {
        animated = 1;
    }, function () {
        animated = 0;
    },
    false,
    "Анимация");
    var log_scale = 0;
    var checkbox_2 = new app.Controls("Controls");
    checkbox_2.addCheckbox(function () {
        log_scale = 1;
       (document.getElementById('Controls').getElementsByTagName('input')[2]).disabled='true';
    }, function () {
        log_scale = 0;
        if (current != 10)
        	(document.getElementById('Controls').getElementsByTagName('input')[2]).removeAttribute('disabled');
    },
    false,
    "Логарифмическая шкала");  
    var vert_segm = 0;
    var checkbox_3 = new app.Controls("Controls");
    checkbox_3.addCheckbox(function () {
        vert_segm = 1;
        (document.getElementById('Controls').getElementsByTagName('input')[1]).disabled='true';
    }, function () {
        vert_segm = 0;
        if ((current != 10) && (current != 13) && (current != 14) && (current != 15))
        	(document.getElementById('Controls').getElementsByTagName('input')[1]).removeAttribute('disabled');
    },
    false,
    "Вертикальные отрезки");
    var line;
    function draw(allPoints, n, board, k, line)
    {
    	var str;
    	if (line)
    		str = "small";
    	else
    		str = "tiny";
    	var tmp = 0;  
		if (animated)   
		{
			var timer = setInterval(function()
			{
				for (i = tmp; i < Math.min(tmp + k, n); i++)
				{
					board.addPoint(allPoints[i][0], allPoints[i][1], {size: str, color : 11});
					if (line)
						board.addLine(allPoints[i][0], allPoints[i][1], allPoints[i + 1][0], allPoints[i + 1][1], {width : 1, color : 0});
				}
				tmp += k;
				if (tmp >= n)
					clearInterval(timer);
			}, 3);
		} 	
		else
			for(tmp = 0; tmp < n; tmp++)    
			{
				board.addPoint(allPoints[tmp][0],allPoints[tmp][1], {size: str, color : 11});
				if (line)
					board.addLine(allPoints[tmp][0], allPoints[tmp][1], allPoints[tmp + 1][0], allPoints[tmp+1][1], {width : 1, color : 0});
			} 
    }
    function draw_segm(allPoints, n, board, time, ord)
    {
    	var ord = 0.5;
    	var tmp = 0;
    	var k = 10;
    	if (animated)
		{
			timer = setInterval(function(){
			for (i = tmp; i < Math.min(tmp + k, n); i++)
				board.addLine(allPoints[i], ord, allPoints[i], -ord, {width : 1, color : 11});
			tmp += k;
			if (tmp >= n)
				clearInterval(timer);
		}, time);
		}
		else	
    		for (tmp = 0; tmp < n; tmp++)
    		{
    			board.addLine(allPoints[tmp], ord, allPoints[tmp], -ord, {width : 1, color : 11});
    		}
    }
	var a = {
		'0' : function () 
		{
			line = 0;
			var allPoints = [];
			var tmp = 1;
			if (vert_segm) 
				{
					var board=Plotter(id,{planeBorder: [0, 1, -1, 1], width: 1300, height: 500});
					var n = 10000;
					for (var b = 2; b <= n; b++)
						for (var a = 1; a < b && tmp < n; a++)
						{
							tmp++;
							allPoints.push(a/b);
						}
					draw_segm(allPoints, n, board, 30);
				}
			else
			{
				if (log_scale)
				{
					var k = 100;
					var n = 40000;
					var board=Plotter(id,{planeBorder: [-0.05, Math.log(1001), 0, 1], width: 1300, height: 500});
					for (var b = 2; b <= n; b++)
						for (var a = 1; a < b && tmp < n; a++)
							allPoints.push([Math.log((tmp++ + 40)/40), a/b]);
				}
				else
				{
					var k = 30;
					var n = 10000;
					var board=Plotter(id,{planeBorder: [0, n, 0, 1], width: 1300, height: 500});
					for (var b = 2; b <= n; b++)
						for (var a = 1; a < b && tmp < n; a++)
							allPoints.push([tmp++, a/b]);
				}
	    		draw(allPoints, n, board, k, line);
	    	}
		},
		'1' : function ()
		{
			line = 0;
			var n = 2000;
			var k = 5;
			var allPoints = [];
			if (vert_segm)
			{
				var board=Plotter(id,{planeBorder: [-2.1, 2.1, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n ; i++)
					{
						allPoints.push(Math.pow(-1, i)*(1+1/i));
					}
				draw_segm(allPoints, n, board, 20);
			}
			else
			{
				if (log_scale)
				{
					var board=Plotter(id,{planeBorder: [0, Math.log(201), -5, 5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([Math.log((i + 10)/10), Math.pow(-1,i)*(1+1/i)]);
				}
				else
				{
					n = 1000;
					var board=Plotter(id,{planeBorder: [0, n, -5, 5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([i, Math.pow(-1,i)*(1+1/i)]);
				}
				draw(allPoints, n, board, k, line);
			}
		},
		'2' : function ()
		{
			var line = 0;
			var n = 2000;
			var k = 5;
			var allPoints = [];
			if (vert_segm)
			{
				var board=Plotter(id,{planeBorder: [-3, 3, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n ; i++)
						allPoints.push(Math.pow(-1, i)*Math.pow((1+1/i), i));
				draw_segm(allPoints, n, board, 20);
			}
			else
			{
				if (log_scale)
				{
					var board = Plotter(id,{planeBorder: [0, Math.log(201), -5, 5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([Math.log((i + 10)/10), Math.pow(-1, i)*Math.pow((1+1/i), i)]);
				}
				else
				{
					n = 1000;
					var board = Plotter(id,{planeBorder: [0, n, -5, 5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([i, Math.pow(-1, i)*Math.pow((1+1/i), i)]);
				}
				draw(allPoints, n, board, k, line);
			}
			

		},
		'3' : function ()
		{
			line = 0;
			var allPoints = [];
			if (vert_segm)
			{
				var n = 10000;
				var board = Plotter(id,{planeBorder: [-1, 1, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push(Math.sin(i));
				draw_segm(allPoints, n, board, 10);
			}
			else
			{
				if (log_scale)
				{
					var k = 100;
					var n = 50000;
					var board = Plotter(id,{planeBorder: [Math.log(10), Math.log(501), -1.5, 1.5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([Math.log((i + 100)/100), Math.sin(i)]);
				}
				else
				{
					var k = 100;
					var n = 50000;
					var board = Plotter(id,{planeBorder: [0, n, -1.5, 1.5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([i, Math.sin(i)]);
				}
				draw(allPoints, n, board, k, line);
			}
			
		},
		'4' : function ()
		{
			var sum = 1, tmp = 1;
			var allPoints_1 = [], allPoints_2 = [];
			if (vert_segm)
			{
				
				if (animated)
				{
					var n = 1000;
					for (var i = 1; i <= n; i++)
					{
						allPoints_1.push(Math.pow((1+1/i), i));
						allPoints_2.push(sum);
						tmp *= i;
						sum += 1/tmp;
					}
					var board = Plotter(id,{planeBorder: [1.9, 3, -1, 1], width: 1300, height: 500});
					tmp = 1;
					timer = setInterval(function(){
					board.addLine(allPoints_1[tmp], 0.5, allPoints_1[tmp], -0.5, {width : 1, color : 3});
					board.addLine(allPoints_2[tmp], 0.5, allPoints_2[tmp], -0.5, {width : 1, color : 0});
					tmp++;
					if (tmp >= n)
						clearInterval(timer);
					}, 30);
				}
				else
				{
					var n = 100;
					var board = Plotter(id,{planeBorder: [0, 4, -1, 1], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
					{
						allPoints_1.push(Math.pow((1+1/i), i));
						allPoints_2.push(sum);
						tmp *= i;
						sum += 1/tmp;
					}
					for (tmp = 0; tmp < n; tmp++)
					{
						board.addLine(allPoints_1[tmp], 0.5, allPoints_1[tmp], -0.5, {width : 1, color : 3});
						board.addLine(allPoints_2[tmp], 0.5, allPoints_2[tmp], -0.5, {width : 1, color : 0});
					}
				}
			}
			else
			{
				if (log_scale)
				{
					var k = 7;
					var n = 1000;
					var board = Plotter(id,{planeBorder: [0, Math.log(1000), 2, 3], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
					{
						allPoints_1.push([Math.log(i), Math.pow((1+1/i), i)]);
						allPoints_2.push([Math.log(i), sum]);
						tmp *= i;
						sum += 1/tmp;
					}
				}
				else
				{
					var k = 1;
					var n = 100;
					var board = Plotter(id,{planeBorder: [-0.5, n, 0, 3], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
					{
						allPoints_1.push([i, Math.pow((1+1/i), i)]);
						allPoints_2.push([i, sum]);
						tmp *= i;
						sum += 1/tmp;
					}
				}
				tmp = 0;    
				board.addLine(0, 2.718, 100, 2.718, {width : 0.5, color : 7});	
	    		if (animated)    	
		    		var timer = setInterval(function()
					{
						for (var i = tmp; i < Math.min(tmp + k, n); i++)
						{
							board.addPoint(allPoints_1[i][0],allPoints_1[i][1], {size : "small", color : 4});
							board.addPoint(allPoints_2[i][0],allPoints_2[i][1], {size : "small"});
							board.addLine(allPoints_1[i][0], allPoints_1[i][1], allPoints_1[i + 1][0], allPoints_1[i + 1][1], {width : 1, color : 0});
							board.addLine(allPoints_2[i][0], allPoints_2[i][1], allPoints_2[i + 1][0], allPoints_2[i + 1][1], {width : 1, color : 0});
						}
						tmp += k;
						if (tmp >= n)
							clearInterval(timer);
					}, 10);
	    		else
	    			for(tmp = 0; tmp < n; tmp++)     		    	
	    			{
	    				board.addPoint(allPoints_1[tmp][0],allPoints_1[tmp][1], {size : "small", color : 4});
	    				board.addPoint(allPoints_2[tmp][0],allPoints_2[tmp][1], {size : "small"});
						board.addLine(allPoints_1[tmp][0], allPoints_1[tmp][1], allPoints_1[tmp + 1][0], allPoints_1[tmp+1][1], {width : 1, color : 0});
						board.addLine(allPoints_2[tmp][0], allPoints_2[tmp][1], allPoints_2[tmp + 1][0], allPoints_2[tmp+1][1], {width : 1, color : 0});
	    			}	
	    	}
		},
		'5' : function ()
		{
			
			var allPoints = [];
			var j = 2, m = 1;
			if (vert_segm)
			{
				var n = 10000;
				var board = Plotter(id,{planeBorder: [-0.1, 0.6, -1, 1], width: 1300, height: 500});
				while (m <= n)
					{
						for (var i = 1; i < j; i++)
						{
							allPoints.push(1/i);
							m++;
						}
						j++;
					}
				draw_segm(allPoints, n, board, 20);
			}
			else
			{
				if (log_scale)
				{
					var n = 20000;
					var k = 40;
					var board = Plotter(id,{planeBorder: [0, Math.log(1001), 0, 0.55], width: 1300, height: 500});
					while (m <= n)
					{
						for (var i = 1; i < j; i++)
							allPoints.push([Math.log((m++ + 10)/10), 1/i]);
						j++;
					}
				}
				else
				{
					var k = 4;
					var n = 2000;
					var board = Plotter(id,{planeBorder: [0, n, 0, 0.55], width: 1300, height: 500});
					while (m <= n)
					{
						for (var i = 1; i < j; i++)
							allPoints.push([m++, 1/i]);
						j++;
					}
				}
				line = 0;
				draw(allPoints, n, board, k, line);
				}
			
		},
		'6' : function ()
		{
			
			var allPoints = [];
			var j = 2, m = 1;
			if (vert_segm)
			{
				var n = 10000;
				var board = Plotter(id,{planeBorder: [-0.1, 0.6, -1, 1], width: 1300, height: 500});
				while (m <= n)
					{
						for (var i = 1; i < j; i++)
						{
							allPoints.push(1/i - 1/m);
							m++;
						}
						j++;
					}
				draw_segm(allPoints, n, board, 30);
			}
			else
			{
				if (log_scale)
				{
					var k = 40;
					var n = 20000;
					var board = Plotter(id,{planeBorder: [0, Math.log(1001), 0, 0.55], width: 1300, height: 500});
					while (m <= n)
					{
						for (var i = 1; i < j; i++)
							allPoints.push([Math.log((m++ + 10)/10), 1/i - 1/m]);
						j++;
					}
				}
				else
				{
					var k = 4;
					var n = 2000;
					var board = Plotter(id,{planeBorder: [0, n, 0, 0.55], width: 1300, height: 500});
					while (m <= n)
					{
						for (var i = 1; i < j; i++)
							allPoints.push([m++, 1/i - 1/m]);
						j++;
					}
				}
				line = 0;
				draw(allPoints, n, board, k, line);
			}
		},
		'7' : function ()
		{
			
			var allPoints = [];
			var k = 1, j = 2;
			if (vert_segm)
			{
				var n = 10000;
				var board=Plotter(id,{planeBorder: [-1, 50, -1, 1], width: 1300, height: 500});
				while (k <= n)
					{
						allPoints.push(0);
						k++;
						for (var i = 1; i < j; i++)
						{
							allPoints.push(i);
							allPoints.push(-i);
							k += 2;
						}
						j++;
					}
				draw_segm(allPoints, n, board, 5);
			}
			else
			{
				if (log_scale)
				{
					var m = 40;
					var n = 20000;
					var board = Plotter(id,{planeBorder: [-0.05, Math.log(1001), -20, 20], width: 1300, height: 500});
					while (k <= n)
					{

						allPoints.push([Math.log((k + 10)/10), 0]);
						k++;
						for (var i = 1; i < j; i++)
						{
							allPoints.push([Math.log((k + 10)/10), i]);
							allPoints.push([Math.log((k + 10)/10), -i]);
							k += 2;
						}
						j++;
					}
				}
				else
				{
					var m = 4;
					var n = 2000;
					var board = Plotter(id,{planeBorder: [-20, n, -30, 30], width: 1300, height: 500});
					while (k <= n)
					{

						allPoints.push([k, 0]);
						k++;
						for (var i = 1; i < j; i++)
						{
							allPoints.push([k, i]);
							allPoints.push([k, -i]);
							k += 2;
						}
						j++;
					}
				}
				line = 0;
				draw(allPoints, n, board, m, line);
			}
			
		},
		'8' : function ()
		{
			var allPoints = [];
			if (vert_segm)
			{
				var n = 3000;
				var board = Plotter(id,{planeBorder: [-0.05, 1.6, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push((2 + Math.pow(-1, i))/i);
				draw_segm(allPoints, n, board, 10);
			}
			else
			{
				if (log_scale)
				{
					var k = 3;
					var n = 1000;
					var board = Plotter(id,{planeBorder: [-0.05, Math.log(1000), 0, 1.55], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)      
						allPoints.push([Math.log(i), (2 + Math.pow(-1, i))/i]);
				}
				else
				{
					var k = 1;
					var n = 300;
					var board = Plotter(id,{planeBorder: [-1, n, 0, 1.2], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)      
						allPoints.push([i, (2 + Math.pow(-1, i))/i]);
				}
				line = 1;
				draw(allPoints, n, board, k, line);
			}
			
		},
		'9' : function ()
		{
			var allPoints = [];
			if (vert_segm)
			{
				var n = 3000;
				var board = Plotter(id,{planeBorder: [-0.05, 1.2, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push((1 + Math.pow(-1, i))/i);
				draw_segm(allPoints, n, board, 10);
			}
			else
			{
				if (log_scale)
				{
					var k = 3;
					var n = 1000;
					var board = Plotter(id,{planeBorder: [-0.05, Math.log(1000), 0, 1.5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)      
						allPoints.push([Math.log(i), (1 + Math.pow(-1, i))/i]);
				}
				else
				{
					var k = 1;
					var n = 300;
					var board = Plotter(id,{planeBorder: [-1, n, 0, 1.5], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)      
						allPoints.push([i, (1 + Math.pow(-1, i))/i]);
				}
				line = 1;
				draw(allPoints, n, board, k, line);
			}
    	},
		'10' : function ()
		{
			var n = 500;
			var k = 2;
			var board = Plotter(id,{planeBorder: [0, n, -1.5, 1.5], width: 1300, height: 500});
			var allPoints = [];
			for (var i = 1; i <= n; i++)
				allPoints.push([i, Math.pow(-1, i)]);
			line = 1;
			draw(allPoints, n, board, k, line);
		},
		'11' : function ()
		{
			var allPoints = [];
			if (vert_segm)
			{
				var n = 10000;
				var board = Plotter(id,{planeBorder: [0, 0.91, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push(Math.pow(0.9, i));
				draw_segm(allPoints, n, board, 30);
			}
			else
			{
				var k = 2;
				if (log_scale)
				{
					var n = 1000;
					var board = Plotter(id,{planeBorder: [-0.005, Math.log(1000), 0, 1], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([Math.log(i), Math.pow(0.9, i)]);
				}
				else
				{
					var n = 500;
					var board = Plotter(id,{planeBorder: [-1, n, 0, 1], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([i, Math.pow(0.9, i)]);
				}
				line = 1;
				draw(allPoints, n, board, k, line);
			}
		},
		'12' : function ()
		{
			var allPoints = [];
			if (vert_segm)
			{
				var n = 1000;
				var board = Plotter(id,{planeBorder: [-1.1, 1.1, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push(Math.pow(-1, i)/i);
				draw_segm(allPoints, n, board, 10);
			}
			else
			{
				var k = 1;
				if (log_scale)
				{
					var n = 300;
					var board = Plotter(id,{planeBorder: [0, Math.log(300), -1.5, 1], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([Math.log(i), Math.pow(-1, i)/i]);
				}
				else
				{
					var n = 300;
					var board = Plotter(id,{planeBorder: [0, n, -1.5, 1], width: 1300, height: 500});
					for (var i = 1; i <= n; i++)
						allPoints.push([i, Math.pow(-1, i)/i]);
				}
				line = 1;
				draw(allPoints, n, board, k, line);
				}
		},
		'13' : function ()
		{
			var k = 2;
			var n = 1000;
			var allPoints = [];
			if (vert_segm)
			{
				var board = Plotter(id,{planeBorder: [-1, 2, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push(2/Math.sqrt(i) - i/(i+5)*Math.sin(Math.PI*i/4));
				draw_segm(allPoints, n, board, 10);
			}
			else
			{
				var board = Plotter(id,{planeBorder: [-0.1, n, -1, 2], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push([i, 2/Math.sqrt(i) - i/(i+5)*Math.sin(Math.PI*i/4)]);
				line = 1;
				draw(allPoints, n, board, k, line);
			}
		},
		'14' : function ()
		{
			var k = 2;
			var n = 1000;
			var allPoints = [];
			if (vert_segm)
			{
				var board = Plotter(id,{planeBorder: [-5, 5, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push(Math.pow(-1, i)*Math.pow(i, 1/i)+ (2*i+6)/i*Math.cos(Math.PI*i/5));
				draw_segm(allPoints, n, board, 10);
			}
			else
			{
				var board = Plotter(id,{planeBorder: [-0.1, n, -5, 5], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push([i, Math.pow(-1, i)*Math.pow(i, 1/i)+ (2*i+6)/i*Math.cos(Math.PI*i/5)]);
				line = 1;
				draw(allPoints, n, board, k, line);
			}
			
		},
		'15' : function ()
		{
			var k = 2;
			var n = 1000;
			var allPoints = [];
			if (vert_segm)
			{
				var board = Plotter(id,{planeBorder: [-2.5, 2.5, -1, 1], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push(Math.pow(Math.cos(Math.PI*i/4), i + 1) + i/(i+10)*Math.sin(Math.PI*i/3));
				draw_segm(allPoints, n, board, 10);
			}
			else
			{
				var board = Plotter(id,{planeBorder: [-0.1, n, -3, 3], width: 1300, height: 500});
				for (var i = 1; i <= n; i++)
					allPoints.push([i, Math.pow(Math.cos(Math.PI*i/4), i + 1) + i/(i+10)*Math.sin(Math.PI*i/3)]);
				line = 1;
				draw(allPoints, n, board, k, line);
			}
			
		}
	}; 
	var select = document.getElementById("List");
	select.onchange = function()
	{
		current = this.selectedIndex;
		(document.getElementById('Controls').getElementsByTagName('input')[1]).removeAttribute('disabled');
		(document.getElementById('Controls').getElementsByTagName("input")[1]).checked = false;
		log_scale = 0;
		(document.getElementById('Controls').getElementsByTagName('input')[2]).removeAttribute('disabled');
		(document.getElementById('Controls').getElementsByTagName("input")[2]).checked = false;
		vert_segm = 0;
		(document.getElementById('Controls').getElementsByTagName("input")[0]).checked = false;
		animated = 0;
		if ((current == 10) || (current == 13) || (current == 14) || (current == 15))
			(document.getElementById('Controls').getElementsByTagName('input')[1]).disabled='true';
		if (current == 10)
			(document.getElementById('Controls').getElementsByTagName('input')[2]).disabled='true';
	}
})("Sequences");

