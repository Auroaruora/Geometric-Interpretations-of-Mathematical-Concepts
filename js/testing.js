// // Hight and width of the canvas
//     const width = 400, height = 400;
//     //coordinate range for the canvas
//     const sz = 5, xmin = -sz, xmax = sz, ymin = -sz, ymax = sz;
//     var rect_map = new Rect_Map([xmin, ymin], [xmax, ymax], width, height);

$(document).ready(function() {

    var tablestring='';
    tablestring +='<table>'
    for(let i = 0; i<1; i=i+1/16){
        tablestring +='<tr>'
        for(let j = 0; j<1; j=j+1/16){
            for(let k = 0;k<1; k=k+1/16){
                tablestring+="<td>"+RGB2HexColor(i,j,k)+"<//td>";
            }
        }
        tablestring +='<//tr>'
    }
    tablestring +='</table>'
    $("#colorTable").html(tablestring)
    
    
    
    
    //Matrix Class testing
    // var matirxA = new Matrix("A",1,2,3,4);
    // var Ainverse = matirxA.inverse();
    // var message = "$$" + matirxA + "$$,"
    // message += "$$" + Ainverse + "$$"
    // $("#testing").html(message);

    //Vector Class testing 

    
    // initialize_canvas("testing", width, height);
    //context = d3.select("#testing");
    // var v1 = new Vector2("v1",[2,1],"#0000ff");
    //$("#v1").addClass("highlight", true);
    //$("#v1").addClass("relocate", true);
    //$("#v1").addClass("highlight", false);
    //v1.remove();
    //v1.draw();

    //testing svg relocating 
    


});     