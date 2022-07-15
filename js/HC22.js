function parseHex(x){
    var hexString
    if(x<0){
        x=0;
    }else if(x>1){
        x=1;
    }else{
        x=256*x;
        x=Math.floor(x);
    }
    hexString = (x).toString(16);
    if(x<16){
        hexString ="0"+hexString;
    }
    return hexString;
}

function RGB2HexColor(r,g,b){
    return "#" + parseHex(r)+parseHex(g)+parseHex(b);
}