'use strict';

var remote = require('electron').remote;

var fs = require('fs');

var process = remote.process;

//remote.getCurrentWindow().closeDevTools();

var appData = '../ForBoot/appData';

if (fs.existsSync('/boot/appData/config.js')) {
  console.log('on pi');
  appData = '/boot/appData';
}

var obtains = [
  `./src/server/express.js`,
  `./src/server/wsServer.js`,
  `${appData}/config.js`,
  'µ/utilities.js',
];

obtain(obtains, ({ fileServer, router, express }, { wss }, { config }, { zeroPad })=> {
  exports.app = {};

  fileServer.use('/audio', express.static(`${appData}/audio`));

  var startPlayTime = Date.now();

  var ctrlFunc = (swing, audio)=> {
    var swingDist = Math.sqrt(Math.pow(swing.point.x, 2) + Math.pow(swing.point.y, 2));
    if (swingDist > .10 && !swing.high && Date.now() - swing.lastHigh > 100 && swing.totalWeight() > 10) {
      swing.lastHigh = Date.now();
      if (!swing.active) {
        swing.active = true;
        audio[0].rampUp();
        console.log('rampUp');
      }

      swing.high = true;
    } else if (swingDist < .1) {
      swing.high = false;
    }

    if ((Date.now() - swing.lastHigh > 5000 || swing.totalWeight() < 10) && swing.active) {
      swing.active = false;
      audio[0].rampDown();
      console.log('rampDown');
    }

    if (!swing.lastHigh) swing.lastHigh = Date.now();
  };

  var setupFunc = (track, num, arr)=> {
    track.volume = 1;
    track.rampTime = 2;
    track.rampUp = ()=> {
      track.volume = Math.min(1, Math.max(0, track.volume + .01));
      clearTimeout(track.ramperTO);
      if (track.volume < 1) track.ramperTO = setTimeout(track.rampUp, track.rampTime * 10);
    };

    track.rampDown = ()=> {
      track.volume = Math.min(1, Math.max(0, track.volume - .01));
      clearTimeout(track.ramperTO);
      if (track.volume > 0) track.ramperTO = setTimeout(track.rampDown, track.rampTime * 10);
    };
  };

  for (let i = 0; i < 6; i++) {
    wss.onOrderedConnect(i, ()=> {
      wss.send(i, {
        audioConfig: {
          tracks: [`http://172.91.0.1/audio/track-${zeroPad(i, 2)}.mp3`],
          ctrlFunc: ctrlFunc.toString(),
          setupFunc: setupFunc.toString(),
        },
        startPlayTime: startPlayTime,
      });
    });
  }

  exports.app.start = ()=> {
    console.log('started');
    fileServer.start();

    document.onkeypress = (e)=> {
      if (e.key == ' ') console.log('Space pressed');
    };

    document.onkeyup = (e)=> {
      if (e.which == 27) {
        var electron = require('electron');
        process.kill(process.pid, 'SIGINT');
      } else if (e.which == 73 && e.getModifierState('Control') &&  e.getModifierState('Shift')) {
        remote.getCurrentWindow().toggleDevTools();
      }
    };

    process.on('SIGINT', ()=> {
      process.nextTick(function () { process.exit(0); });
    });
  };

  provide(exports);
});
