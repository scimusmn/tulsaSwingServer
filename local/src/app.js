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

  for (let i = 0; i < 6; i++) {
    wss.onOrderedConnect(i, ()=> {
      wss.send(i, {
        audioFile: `http://172.91.0.1/audio/track-${zeroPad(i, 2)}.mp3`,
        startPlayTime: startPlayTime,
        controlFunc: ((swing, audio)=> {
          var swingDist = Math.sqrt(Math.pow(swing.point.x, 2) + Math.pow(swing.point.y, 2));
          if (swingDist > .10 && !swing.high && Date.now() - swing.lastHigh > 100 && swing.totalWeight() > 10) {
            swing.lastHigh = Date.now();
            if (!swing.active) {
              swing.active = true;
              audio.rampUp();
              console.log('rampUp');
            }

            swing.high = true;
          } else if (swingDist < .1) {
            swing.high = false;
          }

          if ((Date.now() - swing.lastHigh > 5000 || swing.totalWeight() < 10) && swing.active) {
            swing.active = false;
            audio.rampDown();
            console.log('rampDown');
          }

          if (!swing.lastHigh) swing.lastHigh = Date.now();
        }).toString(),
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
