var app = app || {};

app.Controls = function (id) {
    this.elem = document.getElementById(id);

    this.buttonsNumber = 0;
    this.rangeNumber = 0;
};

app.Controls.prototype.addButton = function (callback, text) {
    var button = document.createElement("button");
    button.innerHTML = text;
    button.addEventListener("click", callback);
    var div = document.createElement("div");
    div.appendChild(button);
    this.elem.appendChild(div);

    this.buttons = this.buttons || [];
    this.buttons.push({
        number: this.buttonsNumber++,
        button: div
    });
};

app.Controls.prototype._initInput = function () {
    this.input = document.createElement("input");

    this.elem.appendChild(this.input);
};

app.Controls.prototype.addCheckbox = function (oncheckedCb, onuncheckedCb, isChecked, text) {

    if (!this.input) {
       // this._initInput();
    }

    var checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");

    checkbox.checked = isChecked;

    function callback () {
        if (this.checked) {
            oncheckedCb();
        } else {
            onuncheckedCb();
        }
    }

    checkbox.addEventListener("change", callback);

    this.elem.appendChild(checkbox);

    var p = document.createElement("span");
    p.innerHTML = text;

    this.elem.appendChild(p);
};

app.Controls.prototype.addRange = function (callback, text, left, right, step, value) {
    var div = document.createElement("div"),
        t = document.createElement("p"),
        range = document.createElement("input");
    t.innerHTML = text;
    div.appendChild(t);

    range.setAttribute("type", "range");
    range.setAttribute("min", left);
    range.setAttribute("max", right);
    range.setAttribute("step", step);
    range.setAttribute("value", value);
    range.addEventListener("input", function () {
        var value = +range.value;
        callback(value);
    });

    div.appendChild(range);
    this.elem.appendChild(div);

    this.ranges = this.ranges || [];
    this.ranges.push({
        number: this.rangeNumber++,
        range: div
    });

    return div;
};