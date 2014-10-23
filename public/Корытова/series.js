(function (id) {
    //app.Plotter1 = app.Plotter({});
    var plot = Plotter(id, {planeBorder: [-5, 5, -5, 5]});

    function test1() {

        var point2 = plot.addPoint(0, 0, { movable: true });
        var point = plot.addPoint(2, 2, { movable: false });
        plot.removePoint(point.getNumber());
        point = plot.addPoint(2, 2, { movable: true });
        plot.removePoint(point.getNumber());

        var line = plot.addLine(0, 0, 1, 1);
        var line2 = plot.addLine(-1, -1, 4, 3, { color: 5, width: 10 });
        plot.setTimeout(function () {
            line.setX1(-2);
            line.setY1(-3);
            plot.removeFunc(func1.getNumber());
            area2.setRangeRight(3.7);
            plot.redraw();
            plot.removeGraphArea(area);
        }, 2000);
        //plot.removeLine(line2.getNumber());
        console.log("point2 number: " + point2.getNumber());
        //plot.removeLine(line.getNumber());

        var badLine = plot.addLine(1, 1, 1, 2);
        console.log("badLine number: " + badLine.getNumber());

        var func1 = plot.addFunc(Math.cos);
        var func2 = plot.addFunc(function (x) {
            return x * x;
        });

        var func3 = plot.addFunc(Math.sin, -20, 20);

        var area = plot.addGraphArea(func2, 0, 1, "x");
        var area2 = plot.addGraphArea(func3, 3.3, 3.5, "y");
        var area3 = plot.addGraphArea(func3, 3.3, 3.5, "x");
    }

    function test2() {
        var t = 0;
        var point = plot.addPoint(Math.cos(t), Math.sin(t), {size: "tiny"});
        plot.setInterval(function () {
            t += 0.1;
            point.setX(Math.cos(t));
            point.setY(Math.sin(t));
            point.update();
        }, 40);
    }

    function test3() {
        var line = plot.addLine(0, 0, 2, 2);
        var point = plot.addPoint(1, 1, { movable: line });
    }

    function test4() {
        var controls = new app.Controls("controls");
        controls.addButton(function () {
            alert("hello, world!");
        }, "hello?");

        controls.addRange(function (value) {
            console.log(value);
        }, "Ползунок:", 0, 10, 0.01, 0);
    }

    function test5() {
        var line = plot.addLine(0, 0, 1, 2);
        var func = plot.addFunc(Math.cos, -20, 20);
        var areaX = plot.addGraphArea(func, 3.3, 3.5, "x");
        var areaY = plot.addGraphArea(func, 3.3, 3.5, "y");

        setTimeout(function () {
            line.setY1(5);
            line.setY2(-5);

            areaX.setRangeRight(3.7);
            areaY.setRangeRight(3.7);

            plot.redraw();
        }, 2000);
    }

    function test6() {
        var controls = new app.Controls("controls");
        controls.addCheckbox(function () {
                alert("checked");
            }, function () {
                alert("unchecked");
            },
            false,
            "hello");

        controls.addButton(function () {
            alert("hello, world!");
        }, "hello?");
    }

    function test7() {
        plot.addPoint(1, 1, {
            onclick: function () {
                alert("hello");
            }
        });
    }

    test1();
    //test2();
    //test3();
    //test4();
    //test5();
    //test6();
   // test7();

})("graph");