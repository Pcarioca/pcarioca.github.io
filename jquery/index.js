



$(document).ready(function () {
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('id', 'play');
    audioElement.setAttribute('src', 'audio/a3.mp3');
    audioElement.setAttribute('autoplay', 'autoplay');
    $.get();
    $("#body").append(audioElement);
    
$('#/*').on('hover', function() {
        audioElement.play();
    });
    var audio = $("#play")[0];
    $("nav a").mouseenter(function() {
      audio.play();
    });


    

});
