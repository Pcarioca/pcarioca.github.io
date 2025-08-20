


(() => {
  const LINES = ["Back already?", "Focus time.", "We move.", "Ship it.", "Stay crispy."];
  let i = 0;
  const next = () => LINES[(i++) % LINES.length];

  const update = () => { document.title = next(); };

  // fire whenever you return to this tab/window
  window.addEventListener('focus', update);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();




$(document).ready(function () {
    let audioElement1 = document.createElement('audio');
    audioElement1.setAttribute('id', 'play');
    audioElement1.setAttribute('src', 'audio/a3.mp3'); //d4
    
    $.get();
    $("#body").append(audioElement1);
    
    
    $("#github").mouseenter(function() {
      audioElement1.play();
      });

      let audioElement2 = document.createElement('audio');
    audioElement2.setAttribute('id', 'play');
    audioElement2.setAttribute('src', 'audio/c3.mp3'); //a3
    
    $.get();
    $("#body").append(audioElement2);
    
    
    $("#mail").mouseenter(function() {
      audioElement2.play();
      });

      let audioElement3 = document.createElement('audio');
    audioElement3.setAttribute('id', 'play');
    audioElement3.setAttribute('src', 'audio/g3.mp3');//d4
    
    $.get();
    $("#body").append(audioElement3);
    
    
    $("#linkedin").mouseenter(function() {
      audioElement3.play();
      });

      let audioElement4 = document.createElement('audio');
    audioElement4.setAttribute('id', 'play');
    audioElement4.setAttribute('src', 'audio/d4.mp3');
    
    $.get();
    $("#body").append(audioElement4);
    
    
    $("#facebook").mouseenter(function() {
      audioElement4.play();
      });

      let audioElement5 = document.createElement('audio');
    audioElement5.setAttribute('id', 'play');
    audioElement5.setAttribute('src', 'audio/e4.mp3');
    
    $.get();
    $("#body").append(audioElement5);
    
    
    $("#instagram").mouseenter(function() {
      audioElement5.play();
      });

      let audioElement6 = document.createElement('audio');
    audioElement6.setAttribute('id', 'play');
    audioElement6.setAttribute('src', 'audio/d5.mp3');
    
    $.get();
    $("#body").append(audioElement6);
    
    
    $("#wca").mouseenter(function() {
      audioElement6.play();
      });
});



