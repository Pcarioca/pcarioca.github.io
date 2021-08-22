$(function(){
    $('#li').hover(
        function() {    $("audio")[0].play();},
        function() {    $("audio")[0].pause();}
        )
    });