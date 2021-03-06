var generate = require('../../lib/generate')
var isStream = require('is-stream')

module.exports = require('../../lib/exercise')({
  dir: __dirname,
  init: function () {
    var data = generate(5 + (Math.random() * 20 | 0))
    var ops = []

    Object.keys(data).forEach(function (key) {
      ops.push({
        type: 'put',
        key: key,
        value: data[key]
      })
    })
    return {
      prepare: function (db, callback) {
        db.batch(ops, callback)
      },
      exec: function (dir, mod, callback) {
        if (typeof mod !== 'function') {
          throw String('{error.mod.not_function}')
        }
        if (mod.length < 1) {
          throw String('{error.mod.not_long_enough}')
        }
        var result = mod(dir)
        if (!isStream(result)) {
          throw String('{error.result_no_stream}')
        }
        var data = []
        var error
        result.on('data', function (entry) {
          data.push(entry)
        })
        result.on('error', function (err) {
          error = err
        })
        result.on('end', function () {
          callback(error, data)
        })
      }
    }
  }
})
