
Vector = function(iname, ihead, icolor){
    this.name = iname;
    this.head = ihead;
    this.color = icolor;
    this.isHiglighted = false;
    this.isFreeze = false;
    
}
Vector.prototype.initialize = function(){
    arrow([0,0],head,iname);
    $(this.name).bind("mouseout mouseover",changeHiglight());
}

Vector.prototype.draw = function(){
}
Vector.prototype.remove = function(){
}
Vector.prototype.changefreeze = function(){

}


Vector.prototype.changeHiglight = function(){
    this.isHiglighted = !(this.isHiglighted);
    var fname = "#" + this.name 
    if(isHiglighted){
        $(fname).toggleClass("highlightVector");
    }else{
        $(fname).toggleClass("unhighlightVector");
    }
}




