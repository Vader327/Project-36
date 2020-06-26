var canvas, database_point, database_line, db_background;
var pos, pointSize;
var clear_button, slider, color_picker, bg_picker;
var slider_value, slider_value_min, slider_value_max;
var cp_text, bg_text, change_bg;
var bg_color = "#ffffff";
var pencil, linePoint;
var selection, line_points, check;

function setup(){
    canvas = createCanvas(1600,800);
    canvas.position(displayWidth/2 - 500,0);

    db_background = firebase.database().ref("Background");
    db_background.on("value",readBackground);

    database_point = firebase.database().ref("Point");
    database_point.on("value",readPosition);

    database_line = firebase.database().ref("Line");
    database_line.on("value",readLine);

    selection = "pencil";
    line_points = [];

    clear_button = createButton("Clear Canvas");
    clear_button.elt.id = "clear_button";
    clear_button.position(canvas.x + 700, 850);

    slider = createSlider(5, 51, 5, 2);
    slider.elt.id = "slider";
    slider.position(400, 870);

    slider_value = createElement("h3");
    slider_value.elt.id = "values";
    slider_value.position(slider.x + 60 ,slider.y + 20);

    slider_value_min = createElement("h3");
    slider_value_min.elt.id = "values";
    slider_value_min.position(slider.x - 130,837);

    slider_value_max = createElement("h3");
    slider_value_max.elt.id = "values";
    slider_value_max.position(slider.x + 320,837);

    color_picker = createColorPicker('#000000');
    color_picker.elt.id = "color_picker"
    color_picker.position(1300,860);

    cp_text = createElement("h3");
    cp_text.elt.id = "values";
    cp_text.position(color_picker.x - 80 ,color_picker.y - 20);
    cp_text.html("Color:");

    bg_picker = createColorPicker(bg_color);
    bg_picker.elt.id = "color_picker"
    bg_picker.position(1700,860);

    bg_text = createElement("h3");
    bg_text.elt.id = "values";
    bg_text.position(bg_picker.x - 230 ,bg_picker.y - 20);
    bg_text.html("Background Color:");

    change_bg = createButton("Change Backgrond");
    change_bg.elt.id = "change_backround";
    change_bg.position(bg_picker.x - 200, bg_picker.y + 50);

    pencil = createButton();
    pencil.elt.innerHTML = "<img src = pencil.png>";
    pencil.elt.id = "selected";
    pencil.elt.title = "Pencil";
    pencil.position(slider_value_min.x - 200, slider_value_min.y - 700);

    linePoint = createButton();
    linePoint.elt.innerHTML = "<img src = line.png>";
    linePoint.elt.id = "paint_button"
    linePoint.elt.title = "Line";
    linePoint.position(pencil.x, pencil.y + 100);
}

function draw(){
    slider_value.html("Size: " + slider.value());
    slider_value_min.html(5);
    slider_value_max.html(51);

    clear_button.mousePressed(()=>{
        clearCanvas();
    })

    change_bg.mousePressed(()=>{
        db_background.set(bg_picker.value());
    })

    pencil.mousePressed(()=>{
        selection = "pencil";
        pencil.elt.id = "selected";
        linePoint.elt.id = "paint_button";
    })
    linePoint.mousePressed(()=>{
        selection = "line";
        linePoint.elt.id = "selected";
        pencil.elt.id = "paint_button";
    })
}

function mouseDragged(){    
    db_background.on("value",readBackground);
    database_line.on("value",readLine);

    if(selection === "pencil"){
        stroke(color_picker.value());
        pointSize = slider.value();
        strokeWeight(pointSize);
        point(mouseX, mouseY);
        writePosition(mouseX, mouseY, pointSize, color_picker.value());
    }
}

function mouseClicked(){
    if(selection==="pencil"||selection==="line"){
        pointSize = slider.value();
        stroke(color_picker.value());
        strokeWeight(pointSize);
        point(mouseX, mouseY);
        writePosition(mouseX, mouseY, pointSize, color_picker.value());

        if(selection === "line"){
        line_points.push(mouseX, mouseY);

            if(line_points.length === 4){
                line(line_points[0],line_points[1],line_points[2],line_points[3]);
                writeLine(pointSize, color_picker.value());
                line_points = [];
            }
        }
    }
}

function readBackground(data){
    background(data.val());
    bg_color = data.val();
}

function readLine(data){
    position = data.val();

    for(pos in position){
        stroke(position[pos].line2.color);
        strokeWeight(position[pos].line2.size);
        line(position[pos].line1.x, position[pos].line1.y,position[pos].line2.x, position[pos].line2.y);
    }
}

function readPosition(data){
    position = data.val();

    for(pos in position){
        stroke(position[pos].color);
        strokeWeight(position[pos].size);
        point(position[pos].x, position[pos].y);
    }

    if(position === null){
        clearCanvas();
    }
}


function writePosition(x,y,size,color){
    database_point.push({
        x : x,
        y : y,
        size : size,
        color : color
    })
}

function writeLine(size,color){
    database_line.push({
        line1:{
            x : line_points[0],
            y : line_points[1],
            size : size,
            color : color
        },
        line2:{
            x : line_points[2],
            y : line_points[3],
            size : size,
            color : color
        }
    })
}


function clearCanvas(){
    database_point.remove();
    database_line.remove();
    clear()
    db_background.on("value",readBackground);
}