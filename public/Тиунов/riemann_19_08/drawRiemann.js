function drawRiemann (id) {    
    drawRiemann.n=500;	    
    drawRiemann.animatedState=0;	
    var napr=0;
    var upStep=25;
    var needForOkr=1;
	var controls=new app.Controls("controls");
    var width=1140;
    var height=Math.ceil($(window).height()*0.9);
    controls.addCheckbox(function () {
        drawRiemann.animatedState=true;
        (document.getElementById('controls').getElementsByTagName('input')[1]).removeAttribute('disabled');  
    }, function () {
        drawRiemann.animatedState=false;
        (document.getElementById('controls').getElementsByTagName('input')[1]).disabled='true';  
    },false,"Анимация<br>");    
    controls.addCheckbox(function() {
        napr=1;
    },function () {
        napr=0;
    },false,"Снизу вверх<br>");
    (document.getElementById('controls').getElementsByTagName('input')[1]).disabled='true';
    controls.addCheckbox(function () {
        needForOkr=1;
    },function () {
        needForOkr=0;
    },true,"Интерактивность<br>"); 
    controls.addButton(function () {        
        createBoard(drawRiemann.animatedState);
    }, "Рисовать");     
    var board=Plotter(id,{planeBorder: [0,1,0,drawRiemann.n], width: width, height: height});

    var allPoints=[];
    var pointsMap={};    
    var curPoint;
    var lastSelectedPoint;
    var lastFoundedPoint;
    createBoard.firstTime=true;    
    function createBoard(animated) {          
        board=Plotter(id,{planeBorder: [0,1,0,drawRiemann.n], width: width, height: height});
        (document.getElementById('controls').getElementsByTagName('input')[2]).disabled='true';  
        allPoints=[];	
        pointsMap={};    	
    	for(var i=1;i<drawRiemann.n;++i)
    		for(var j=1;j<i;++j)
    			if (gcd(i,j)==1)
    				allPoints.push([j/i,i]);  
        console.log(allPoints.length);
    	if (!napr)
            allPoints.sort(function (ls,rs) {
    		if (ls[0]!=rs[0])
    			return ls[0]-rs[0];
    		else
    			return ls[1]-rs[1];
    	});    	    	
    	var tmp=0;    	        
    	if (animated)  
        {
            var cnt=Math.floor(allPoints.length/100);
    		var timer = setInterval(function()
			{
                for(var k=tmp;k<Math.min(tmp+cnt,allPoints.length);++k)
				    allPoints[k]=board.addPoint(allPoints[k][0],allPoints[k][1],{
                        color: 10,
                        onclick: function () {
                            newPointSelected(this)
                        },
                        size: getSize(allPoints[k][1])
                    });
				tmp+=cnt;
				if (tmp>=allPoints.length)
				{
                    clearInterval(timer);
                    if (needForOkr)
                        continueBuild();
                }
			}, 1);
        }
    	else
        {            
    		for(var tmp=0;tmp<allPoints.length;++tmp)     		    		
    			allPoints[tmp]=board.addPoint(allPoints[tmp][0],allPoints[tmp][1],{
                    color: 10,
                    onclick: function () {
                        newPointSelected(this)
                    },
                    size: getSize(allPoints[tmp][1])
                });  
            if (needForOkr)
                continueBuild();          
        }
    }
    function continueBuild() {        
        for(i=0;i<allPoints.length;++i)        
        {
            if (Math.abs(allPoints[i].getX()-0.5)<1.0e-9)
            {
                var opPoint=allPoints[i];
                //break;
            }
            pointsMap[allPoints[i].getNumber()]=i;
        }        
        updateRanges(rup(2));
        createBoard.firstTime=false;  
        changeUp.prevLine=changeLeft.prevArea=changeLeft.func=undefined;                      
        colorize(opPoint);
    }
    function updateRanges(y) {
        if (!createBoard.firstTime)
        {
            var myNode = document.getElementById("ranges");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            /*if (changeUp.prevLine!=undefined)
            {
                board.removeLine(changeUp.prevLine.getNumber());
                board.removeGraphArea(changeLeft.prevArea.getNumber());
            }
            changeUp.prevLine=changeLeft.prevArea=undefined;*/
        }
        var ranges = new app.Controls("ranges");
        ranges.addRange(function (value) {
            changeUp(value);
        }, "Верхняя граница", 0, drawRiemann.n-upStep, upStep, y);
        ranges.addRange(function (value) {
            changeLeft(value);
        }, "Окрестность", 0.003, 0.5, 0.001, 0.03); 
    }

    function colorize(point)
    {
        curPoint=point;
        var y=rup(curPoint.getY());
        changeUp(y);
        changeLeft(0.03);        
    }
    function changeUp(y)
    {
        if (allPoints.length==0)
            return;
        if (typeof changeUp.prevLine=='undefined')
            changeUp.prevLine=board.addLine(0,y,1,y,{color: 9});
        else
        {                        
            board.removeLine(changeUp.prevLine.getNumber());
            changeUp.prevLine=board.addLine(0,y,1,y,{color: 9});
        }        
        findPoint(changeUp.prevLine,changeLeft.prevArea);
    }
    function changeLeft(x)
    {
        if (allPoints.length==0)
            return;
        if (typeof changeLeft.prevArea=='undefined')
        {         
            if (typeof changeLeft.func=='undefined')            
                changeLeft.func=board.addFunc(function(x){return drawRiemann.n;},0,1);
            changeLeft.prevArea=board.addGraphArea(changeLeft.func,curPoint.getX()-x,curPoint.getX()+x,"x");                    
        } else
        {                               
            board.removeGraphArea(changeLeft.prevArea.getNumber());
            changeLeft.prevArea=board.addGraphArea(changeLeft.func,curPoint.getX()-x,curPoint.getX()+x,"x");                        
        }  
        findPoint(changeUp.prevLine,changeLeft.prevArea);
    }
    function findPoint(up,okr)
    {        
        if (typeof up=='undefined')
            return;        
        else
            var y=up.getY1();
        if (typeof okr=='undefined')        
            return;        
        else
            var x=okr.getRangeRight()-curPoint.getX();
        for(var i=0;i<allPoints.length;++i)
            if (allPoints[i].getY()>y && allPoints[i].getX()>curPoint.getX()-x && allPoints[i].getX()<curPoint.getX()+x &&
                (allPoints[i].getX()!=curPoint.getX() || allPoints[i].getY()!=curPoint.getY()))
            {
                if (typeof lastSelectedPoint!='undefined')
                {
                    var fir=[lastSelectedPoint.getX(),lastSelectedPoint.getY(),lastSelectedPoint.getNumber()];
                    var sec=[lastFoundedPoint.getX(),lastFoundedPoint.getY(),lastFoundedPoint.getNumber()];
                    board.removePoint(lastSelectedPoint.getNumber());
                    board.removePoint(lastFoundedPoint.getNumber());
                    var ind1=pointsMap[fir[2]],ind2=pointsMap[sec[2]];
                    allPoints[ind1]=board.addPoint(fir[0],fir[1],{
                        color: 10,
                        onclick: function () {
                            newPointSelected(this)
                        },
                        size: getSize(fir[1])
                    });
                    allPoints[ind2]=board.addPoint(sec[0],sec[1],{
                        color: 10,
                        onclick: function () {
                            newPointSelected(this)
                        },
                        size: getSize(sec[1])
                    });
                    pointsMap[allPoints[ind1].getNumber()]=ind1;
                    pointsMap[allPoints[ind2].getNumber()]=ind2;
                }
                fir=[curPoint.getX(),curPoint.getY(),curPoint.getNumber()];
                sec=[allPoints[i].getX(),allPoints[i].getY(),allPoints[i].getNumber()];
                board.removePoint(curPoint.getNumber());
                board.removePoint(allPoints[i].getNumber());
                ind1=pointsMap[fir[2]],ind2=pointsMap[sec[2]];
                allPoints[ind1]=board.addPoint(fir[0],fir[1],{
                    color: 3,
                    onclick: function () {
                        newPointSelected(this)
                    },
                    size: /*nextSize(getSize(fir[1]))*/"huge"
                });
                allPoints[ind2]=board.addPoint(sec[0],sec[1],{
                    size: /*nextSize(getSize(sec[1]))*/"huge",
                    color: 1,
                    onclick: function () {
                        newPointSelected(this);
                    }
                });
                pointsMap[allPoints[ind1].getNumber()]=ind1;
                pointsMap[allPoints[ind2].getNumber()]=ind2;
                lastFoundedPoint=allPoints[ind2];
                lastSelectedPoint=allPoints[ind1];
                break;
            }
    }
    function getPointNumber(circle) {
        var expr=/num(\d+)/;
        return +(expr.exec(circle.outerHTML)[1]);
    }
    function newPointSelected(point)
    {
        if (!needForOkr)
            return;
        var nPoint=allPoints[pointsMap[getPointNumber(point)]];
        updateRanges(rup(nPoint.getY()));
        colorize(nPoint);
    }
    function rup(y) {
        return Math.min(Math.ceil(y/upStep)*upStep,drawRiemann.n-upStep);
    }
    function getSize(y) {
        /*if (y<drawRiemann.n/4)
            return "large";
        else if (y<drawRiemann.n/2)
            return "medium";
        else if (y<3*drawRiemann.n/4)
            return "small";
        else*/
            return "tiny";        
    }    

	function gcd(a,b) {
		return !b?a:gcd(b,a%b);
	}
    drawRiemann.changeN = function (radioButton) {
        drawRiemann.n=+radioButton.value;
        //createBoard(drawRiemann.animatedState);
    }
}
drawRiemann("riemannGraph");