
$(document).ready(function() {
    var matirxA = new Matrix("A",1,2,3,4);
    var Ainverse = matirxA.inverse();
    var message = "$$" + matirxA + "$$,"
    message += "$$" + Ainverse + "$$"
    $("#testing").html(message);
});     