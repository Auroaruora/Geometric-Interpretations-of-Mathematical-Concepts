
Vector = function(iname, ihead, icolor){
    this.name = iname;
    this.head = ihead;
    this.color = icolor;
    this.isVisible = true;
    this.isHiglighted = false;
    this.isFr
    
}
Vector.prototype.initialize = function(){
    arrow([0,0],head,iname);
    $(this.name).bind("mouseout mouseover",changeHiglight());
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




