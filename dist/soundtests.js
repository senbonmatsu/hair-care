let start = document.getElementById('startWave');//get...htmlから一致したidをひろってくる
let events = "click";
document.addEventListener(events,function(){
  startWaveAnimation();
})


function startWaveAnimation() {
  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // First get ahold of the legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  // set up forked web audio context, for multiple browsers
  // window. is needed otherwise Safari explodes

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var source;
  // var stream;

  // grab the mute button to use below

  var mute = document.querySelector('.mute');

  //set up the different audio nodes we will use for the app

  var analyser = audioCtx.createAnalyser();
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;

  var distortion = audioCtx.createWaveShaper();
  var gainNode = audioCtx.createGain();
  var biquadFilter = audioCtx.createBiquadFilter();
  var convolver = audioCtx.createConvolver();


  // set up canvas context for visualizer


  //main block for doing the audio recording

  if (navigator.mediaDevices.getUserMedia) {
     console.log('getUserMedia supported.');
     var constraints = {audio: true}
     navigator.mediaDevices.getUserMedia (constraints)
        .then(
          function(stream) {
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(distortion);
            distortion.connect(biquadFilter);
            biquadFilter.connect(gainNode);
            convolver.connect(gainNode);
            gainNode.connect(analyser);
            // analyser.connect(audioCtx.destination);

            visualize();
        })
        .catch( function(err) { console.log('The following gUM error occured: ' + err);})
  } else {
     console.log('getUserMedia not supported on your browser!');
  }

  function visualize() {


      analyser.fftSize = 2048;
      var bufferLengthAlt = analyser.frequencyBinCount;
      console.log(bufferLengthAlt);
      var dataArrayAlt = new Uint8Array(bufferLengthAlt);
      let img = document.getElementById("image_place");
      let idx=1;
      var wash=0;


      var drawAlt = function() {
        drawVisual = requestAnimationFrame(drawAlt);

        analyser.getByteFrequencyData(dataArrayAlt);//150~350くらいの周波数がほしい

        for(var i = 0; i < bufferLengthAlt; i++) {
          if(wash>=1200000){
            idx=3;
            console.log('end')
            img.src="./images/image"+idx+".png";
            break;
          }if (dataArrayAlt[7] > 20 ||dataArrayAlt[8] > 20 ||dataArrayAlt[9] > 20 ||dataArrayAlt[10] > 20 ||dataArrayAlt[11] > 20 ||dataArrayAlt[12] > 20 ||dataArrayAlt[13] > 20 ||dataArrayAlt[14] > 20 ||dataArrayAlt[15] > 20 ||dataArrayAlt[16] > 20 ){
            idx=2;
            wash += 1;
            console.log(wash)
          }else{
            idx=1;
          }
          img.src="./images/image"+idx+".png";
          //console.log(dataArrayAlt);

        }
        
      };

      drawAlt();
  }


}
