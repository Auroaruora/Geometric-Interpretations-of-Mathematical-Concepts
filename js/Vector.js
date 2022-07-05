
Vector2 = function(iname, ihead, icolor){
    this.name = iname;
    this.head = ihead;
    this.color = icolor;
    this.isHiglighted = false;
    this.isFreeze = false;
    arrow([0,0],ihead,iname);
    //$(this.name).bind("mouseout mouseover",changeHiglight);
    
}
Vector2.prototype.initialize = function(){
    arrow([0,0],head,iname);
    //$(this.name).bind("mouseout mouseover",changeHiglight());
}

Vector2.prototype.draw = function(){
    arrow([0,0],head,iname);
}

Vector2.prototype.changeHead = function(arg1){
    this.head = arg1;
}

Vector2.prototype.remove = function(){
    var fname = "#" + this.name;
    d3.select(fname).remove();
}
Vector2.prototype.changefreeze = function(){

}


Vector2.prototype.changeHiglight = function(){
    this.isHiglighted = !(this.isHiglighted);
    var fname = "#" + this.name;
    if(isHiglighted){
        $(fname).toggleClass("highlightVector");
    }else{
        $(fname).toggleClass("unhighlightVector");
    }
}

//This function takes an 2D array(a matrix)
Vector2.prototype.changeBasis = function(arg1){
    return [(arg[0][0] * head[0]+arg[0][1] * head [1])
            ,(arg[1][0] * head[0]+arg[1][1] * head [1])]

}




