'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dns = require('dns');

var _dns2 = _interopRequireDefault(_dns);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');
require('babel-register');

var DomainBrute = function () {
  function DomainBrute(opts, callback) {
    _classCallCheck(this, DomainBrute);

    var server = opts.server,
        filePath = opts.filePath,
        concurrency = opts.concurrency,
        target = opts.target;

    this.opts = opts;
    this.target = target;
    this.filePath = filePath;
    this.concurrency = concurrency;
    this.callback = callback || function () {};
    this.bar = null;
    _dns2.default.setServers(server);
    return this;
  }

  _createClass(DomainBrute, [{
    key: 'readFile',
    value: function readFile(filePath) {
      return _fs2.default.readFileSync(filePath, 'utf8');
    }
  }, {
    key: 'generateDict',
    value: function generateDict(names) {
      var _this = this;

      return names.map(function (_) {
        return [_.trim(), _this.target].join('.');
      });
    }
  }, {
    key: 'httpBanner',
    value: function httpBanner(ip, vhost) {
      return new _bluebird2.default(function (resolve, reject) {
        var port = 80;
        var socket = _net2.default.createConnection({ port: port, host: ip });
        socket.write('HEAD / HTTP/1.1\r\nHost: ' + vhost + '\r\nUser-agent: Mozilla/5.0\r\n\r\n');
        var data = Buffer('');
        socket.setTimeout(2000).on('data', function (chunk) {
          data = Buffer.concat([data, chunk]);
          socket.end();
        }).on('error', function (err) {
          return null;
        }).on('end', function () {
          var response = data.toString('utf8');
          var sep = response.includes('\r\n') ? '\r\n' : '\n';
          var headers = response.split(sep);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = headers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var field = _step.value;

              if (field.startsWith('Server: ')) return resolve(field.substr(8));
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var banner = headers[0].split(' ');
          if (banner.length > 1) return resolve('HTTP ' + banner[1]);
          resolve();
        });
      });
    }
  }, {
    key: 'resolveDomain',
    value: function resolveDomain(domain) {
      var _this2 = this;

      return new _bluebird2.default(function (resolve, reject) {
        var time = new Date();
        _dns2.default.resolve4(domain, function (err, result) {
          var timeEnd = new Date();
          var s = timeEnd - time;
          _this2.bar.tick(1);
          if (err) {
            // 返回 reject 将会中断全部 map
            _this2.callback(err);
            return resolve();
          }

          // 无论有无 banner 都会执行 then 操作
          _this2.httpBanner(result[0], domain).then(function (banner) {
            _this2.bar.interrupt(domain + ' - ' + (Array.isArray(result) ? result.join(', ') : JSON.stringify(result)) + (banner ? ' [' + banner + ']' : '') + ' - ' + s + 'ms');
          });

          _this2.callback(null, { domain: domain, result: result });
          return resolve(result);
        });
      });
    }
  }, {
    key: 'run',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _opts, server, filePath, concurrency, target, fileData, names, dict, bar;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _opts = this.opts, server = _opts.server, filePath = _opts.filePath, concurrency = _opts.concurrency, target = _opts.target;

                console.log('DEBUG: opts:' + JSON.stringify({ server: server, filePath: filePath, concurrency: concurrency, target: target }));
                _context.next = 4;
                return this.readFile(this.filePath);

              case 4:
                fileData = _context.sent;
                names = fileData.trim().split('\n');
                dict = this.generateDict(names);
                bar = new _progress2.default('Running [:bar] :current/:total :percent :etas', {
                  complete: '=',
                  incomplete: ' ',
                  width: 50,
                  total: dict.length
                });


                this.bar = bar;
                return _context.abrupt('return', _bluebird2.default.map(dict, this.resolveDomain.bind(this), { concurrency: this.concurrency }));

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function run() {
        return _ref.apply(this, arguments);
      }

      return run;
    }()
  }]);

  return DomainBrute;
}();

exports.default = DomainBrute;
//# sourceMappingURL=index.js.map