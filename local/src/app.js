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
        audioFile: `sensor-server.net/audio/track-${zeroPad(i, 2)}.mp3`,
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
