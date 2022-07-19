function parseHex(x){
    if (isNaN(x))
	return "00";

    // else
    if(x < 0)
    {
        x = 0;
    }
    else if(1 <= x)
    {
        x = 255.5/256; // ensure we don't return "100"
    }

    var hexString = (Math.floor(256*x)).toString(16);

    if (hexString.length == 1)
	hexString = "0" + hexString;
    
    return hexString;
}

function RGB2HexColor(dens){
    return "#" + parseHex(dens[0]) + parseHex(dens[1]) + parseHex(dens[2]);
}