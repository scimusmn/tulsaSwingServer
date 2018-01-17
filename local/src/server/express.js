obtain(['express', 'body-parser', 'fs'], (express, bodyParser, fs)=> {
  var fileServer = express();
  var router = express.Router();

  router.use(bodyParser.json());

  fileServer.use('', express.static('./client'));
  fileServer.use('/common', express.static('./common'));

  fileServer.listen(80, function () {
    console.log('listening on 80');
  });

  exports.fileServer = fileServer;
  exports.router = router;
});
