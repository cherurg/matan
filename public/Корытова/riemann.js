(function (id) {
	var button = new app.Controls("controls");
    button.addButton(function () {    	
    	painted();
    }, "Рисовать"); 
    var animated = 0;
    var checkbox_1 = new app.Controls("controls");
    checkbox_1.addCheckbox(function () {
        animated = 1;
    }, function () {
        animated = 0;
    },
    false,
    "Анимация");
    function gcd(a,b) {
		return !b ? a : gcd(b,a % b);
	};
	function painted()
	{
		var n = 600;
		var board = Plotter(id,{planeBorder: [0,1,0,0.55], width: 1300, height: 500});
		var allPoints = [];
		for(var i = 1; i < n; i++)
    		for(var j = 1; j < i; j++)
    			if (gcd(i, j) == 1)
    				allPoints.push([j/i, 1/i]);
        //console.log("Количество точек в массиве " + allPoints.length);
    	var tmp = 0;
        var k, time;
        var count1 = 20, count2 = 100, count3 = 200, count4 = 1000;
    	if (animated)
    	{
    		/*allPoints.sort(function (ls,rs) {
    		if (ls[0] != rs[0])
    			return ls[0] - rs[0];
    		else
    			return ls[1] - rs[1];
    		});*/
    		var timer = setInterval(function()
			{
                if (tmp < 100)
                {
                    k = 1;
                    time = 7;
                }
                else
                    if (tmp < count3)
                    {
                        k = 3;
                        time = 5;
                    }
                    else
                        if (tmp < count4)
                            {
                                k = 10;
                                time = 2;
                            }
                        else
                        {
                            k = 100;
                            time = 0.5;
                        }
                for (i = tmp; i < Math.min(tmp + k, allPoints.length); i++)
                    if (i < count1)
                        board.addPoint(allPoints[i][0],allPoints[i][1],{size : "medium", color : -1});
                    else
                        if (i < count2)
                            board.addPoint(allPoints[i][0],allPoints[i][1],{size : "small", color : -1});
                        else
                            board.addPoint(allPoints[i][0],allPoints[i][1],{size : "tiny", color : -1});
                tmp += k;
				if (tmp >= allPoints.length)
					clearInterval(timer);
			}, time);
    	} 
    	else
    		for (i = 0; i < allPoints.length; i++)
    			if (i < count1)
                        board.addPoint(allPoints[i][0],allPoints[i][1],{size : "medium", color : -1});
                    else
                        if (i < count2)
                            board.addPoint(allPoints[i][0],allPoints[i][1],{size : "small", color : -1});
                        else
                            board.addPoint(allPoints[i][0],allPoints[i][1],{size : "tiny", color : -1});
	};

})("riemann_graph");