var canvas, database_point, database_line, database_vertex, db_background;
var pos, pointSize, shouldDraw, vertexCount, temp_arr;
var clear_button, slider, color_picker, bg_picker;
var slider_value, slider_value_min, slider_value_max;
var cp_text, bg_text, change_bg;
var bg_color = "#ffffff";
var pencil, linePoint, vertexButton, drawVertex;
var selection, line_points, vertex_points, check;

function setup(){
    canvas = createCanvas(1600,800);
    canvas.position(displayWidth/2 - 500,0);

    db_background = firebase.database().ref("Background");
    db_background.on("value",readBackground);

    database_point = firebase.database().ref("Point");
    database_point.on("value",readPosition);

    database_line = firebase.database().ref("Line");
    database_line.on("value",readLine);

    database_vertex = firebase.database().ref("Vertex");
    database_vertex.on("value",readVertex);

    selection = "pencil";
    line_points = [];
    vertex_points = [];
    temp_arr = [];
    shouldDraw = true;
    vertexCount = 0;

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

    vertexButton = createButton();
    vertexButton.elt.innerHTML = "<img src = vertex.png>";
    vertexButton.elt.id = "paint_button"
    vertexButton.elt.title = "Vertex";
    vertexButton.position(linePoint.x, linePoint.y + 100);

    drawVertex = createButton("Draw Vertex");
    drawVertex.elt.id = "clear_button"
    drawVertex.elt.title = "Draw the figure after placing the points.";
    drawVertex.position(canvas.x*10, canvas.y + 100);
    drawVertex.hide();
}

function draw(){
    slider_value.html("Size: " + slider.value());
    slider_value_min.html(5);
    slider_value_max.html(51);

    if(selection === "vertex"){drawVertex.show();}

    slider.mousePressed(()=>{
        shouldDraw = false;
    })
    color_picker.mousePressed(()=>{
        shouldDraw = false;
    })
    bg_picker.mousePressed(()=>{
        shouldDraw = false;
    })

    clear_button.mousePressed(()=>{
        clearCanvas();
        shouldDraw = false;
    })

    change_bg.mousePressed(()=>{
        db_background.set(bg_picker.value());
        shouldDraw = false;
    })

    pencil.mousePressed(()=>{
        selection = "pencil";
        pencil.elt.id = "selected";
        linePoint.elt.id = "paint_button";
        vertexButton.elt.id = "paint_button";
        shouldDraw = false;
    })
    linePoint.mousePressed(()=>{
        selection = "line";
        linePoint.elt.id = "selected";
        pencil.elt.id = "paint_button";
        vertexButton.elt.id = "paint_button";
        shouldDraw = false;
    })
    vertexButton.mousePressed(()=>{
        selection = "vertex";
        vertexButton.elt.id = "selected";
        pencil.elt.id = "paint_button";
        linePoint.elt.id = "paint_button";
        shouldDraw = false;
    })
}

function mouseDragged(){   
    shouldDraw = true; 
    db_background.on("value",readBackground);
    database_line.on("value",readLine);
    database_vertex.on("value",readVertex);

    if(selection === "pencil"){
        stroke(color_picker.value());
        pointSize = slider.value();
        strokeWeight(pointSize);
        point(mouseX, mouseY);
        writePosition(mouseX, mouseY, pointSize, color_picker.value());
    }
}

function mouseClicked(){
    if((selection==="pencil"||selection==="line") && shouldDraw===true){
        shouldDraw = true;
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

    if(selection === "vertex" && shouldDraw === true){
        shouldDraw = true;
        pointSize = slider.value();
        fill(color_picker.value());
        strokeWeight(pointSize);
        stroke("black");

        beginShape();
        point(mouseX, mouseY);
        vertex_points.push(mouseX, mouseY);

        drawVertex.mousePressed(()=>{
            vertexCount+=1;
            shouldDraw = false;
            for(var x = 0; x < vertex_points.length; x+=2){
                vertex(vertex_points[x], vertex_points[x+1]);
            }

            vertex(vertex_points[0], vertex_points[1]);
            endShape();
            writeVertex(pointSize, color_picker.value(), vertexCount);
            vertex_points = [];
        })
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

function readVertex(data){
    position = data.val();

    /*for(pos in position){
        //stroke(position[pos].color);
        //strokeWeight(position[pos].size);
        //beginShape();
        //endShape();
    }*/
    if(position !== null){
        for(pos in position){
            beginShape();
            for(var obj of Object.entries(position[pos])){
                fill(obj[1].color);
                strokeWeight(obj[1].size);
                vertex(obj[1].x, obj[1].y);
                temp_arr.push(obj[1].x, obj[1].y);
            }
            //console.log(temp_arr);
            vertex(temp_arr[0], temp_arr[1])
            endShape();
            temp_arr = [];
        }
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

function writeVertex(size,color,id){
    for(var i = 0; i < vertex_points.length; i+=2){
        firebase.database().ref("Vertex/"+id).push({
            x : vertex_points[i],
            y : vertex_points[i + 1],
            size : size,
            color : color,
        })
    }
}


function clearCanvas(){
    database_point.remove();
    database_line.remove();
    database_vertex.remove();
    clear()
    db_background.on("value",readBackground);
    vertexCount = 0;
}