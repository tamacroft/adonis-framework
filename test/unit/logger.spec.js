'use strict'

/*
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const path = require('path')
const fs = require('fs-extra')
const { ioc } = require('@adonisjs/fold')
const stdout = require('test-console').stdout
const stderr = require('test-console').stderr
const { Config, Helpers } = require('@adonisjs/sink')

const FileDriver = require('../../src/Logger/Drivers').file
const ConsoleDriver = require('../../src/Logger/Drivers').console
const Logger = require('../../src/Logger')
const LoggerManager = require('../../src/Logger/Manager')

const sysLog = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}

test.group('Logger | File Driver', (group) => {
  group.beforeEach(() => {
    this.config = new Config()
    this.helpers = new Helpers(path.join(__dirname))
  })

  group.before((done) => {
    fs.ensureDir(path.join(__dirname, 'tmp'), done)
  })

  group.after((done) => {
    if (process.platform === 'win32') {
      return done()
    }
    fs.remove(path.join(__dirname, 'tmp'), done)
  })

  test('initiate logger with correct settings', (assert) => {
    const fileDriver = new FileDriver(this.config, this.helpers)
    assert.deepEqual(fileDriver.logger.levels, sysLog)
    assert.equal(fileDriver.logger.transports['adonis-app'].dirname, path.join(__dirname, 'tmp'))
  })

  test('do not override filename when it is absolute path', (assert) => {
    const config = new Config()
    config.set('app.logger.file', {
      filename: path.join(__dirname, 'my.log')
    })
    const fileDriver = new FileDriver(config, this.helpers)
    assert.equal(fileDriver.config.filename, path.join(__dirname, 'my.log'))
  })

  test('log info to the file', (assert, done) => {
    const fileDriver = new FileDriver(this.config, this.helpers)
    fileDriver.log(6, 'hello', () => {
      fs.readFile(fileDriver.config.filename, (error, contents) => {
        if (error) {
          return done(error)
        }
        contents = JSON.parse(contents)
        assert.equal(contents.message, 'hello')
        assert.equal(contents.level, 'info')
        done()
      })
    })
  }).timeout(3000)

  test('return active log level', (assert) => {
    const fileDriver = new FileDriver(this.config, this.helpers)
    assert.equal(fileDriver.level, 'info')
  })

  test('update log level', (assert) => {
    const fileDriver = new FileDriver(this.config, this.helpers)
    fileDriver.level = 'debug'
    assert.equal(fileDriver.level, 'debug')
  })
})

test.group('Logger | Console Driver', (group) => {
  group.beforeEach(() => {
    this.config = new Config()
  })

  test('initiate logger with correct settings', (assert) => {
    const fileDriver = new ConsoleDriver(this.config)
    assert.deepEqual(fileDriver.logger.levels, sysLog)
  })

  test('log info to the console', (assert, done) => {
    const fileDriver = new ConsoleDriver(this.config)
    const inspect = stdout.inspect()
    fileDriver.log(6, 'hello', () => {
      inspect.restore()
      assert.include(inspect.output[0], 'hello')
      done()
    })
  }).timeout(3000)

  test('return active log level', (assert) => {
    const fileDriver = new ConsoleDriver(this.config)
    assert.equal(fileDriver.level, 'info')
  })

  test('update log level', (assert) => {
    const fileDriver = new ConsoleDriver(this.config)
    fileDriver.level = 'debug'
    assert.equal(fileDriver.level, 'debug')
  })
})

test.group('Logger | Instance', (group) => {
  group.beforeEach(() => {
    this.config = new Config()
  })

  test('log info using defined driver', (assert, done) => {
    const logger = new Logger(new ConsoleDriver(this.config))
    const inspect = stdout.inspect()
    logger.info('hello', () => {
      inspect.restore()
      assert.include(inspect.output[0], 'info')
      done()
    })
  })

  test('log warning using defined driver', (assert) => {
    const logger = new Logger(new ConsoleDriver(this.config))
    const inspect = stdout.inspect()
    logger.warning('hello')
    inspect.restore()
    assert.include(inspect.output[0], 'warning')
  })

  test('do not log level before the level defined on the driver', (assert, done) => {
    const logger = new Logger(new ConsoleDriver(this.config))
    const inspect = stderr.inspect()
    logger.debug('hello', () => {
      inspect.restore()
      assert.lengthOf(inspect.output, 0)
      done()
    })
  })

  test('update log level', (assert, done) => {
    const logger = new Logger(new ConsoleDriver(this.config))
    logger.level = 'debug'
    const inspect = stderr.inspect()
    logger.debug('hello', () => {
      inspect.restore()
      assert.include(inspect.output[0], 'debug')
      done()
    })
  })

  test('get current log level', (assert) => {
    const logger = new Logger(new ConsoleDriver(this.config))
    assert.equal(logger.level, 'info')
  })
})

test.group('Logger | Manager', (group) => {
  group.before(() => {
    ioc.fake('Adonis/Src/Config', () => new Config())
    ioc.fake('Adonis/Src/Helpers', () => new Helpers(path.join(__dirname)))
  })

  test('extend logger by adding drivers', (assert) => {
    const myDriver = {}
    LoggerManager.extend('myDriver', myDriver)
    assert.deepEqual(LoggerManager._drivers, { myDriver })
  })

  test('throw error when trying to access invalid logger driver', (assert) => {
    const logger = new LoggerManager(new Config())
    const fn = () => logger.driver('foo')
    assert.throw(fn, 'E_INVALID_LOGGER_DRIVER: Logger driver foo does not exists')
  })

  test('return logger instance with selected driver', (assert) => {
    const logger = new LoggerManager(new Config())
    assert.instanceOf(logger.driver('file'), Logger)
    assert.instanceOf(logger.driver('file').driver, FileDriver)
  })

  test('return logger instance with extended driver', (assert) => {
    const myDriver = {}
    LoggerManager.extend('myDriver', myDriver)
    const logger = new LoggerManager(new Config())
    assert.instanceOf(logger.driver('myDriver'), Logger)
    assert.deepEqual(logger.driver('myDriver').driver, myDriver)
  })

  test('create singleton logger instances', (assert) => {
    const logger = new LoggerManager(new Config())
    logger.driver('file')
    assert.lengthOf(Object.keys(logger._loggerInstances), 1)
    logger.driver('file')
    assert.lengthOf(Object.keys(logger._loggerInstances), 1)
  })

  test('proxy logger instance methods', (assert, done) => {
    const logger = new LoggerManager(new Config())
    const inspect = stdout.inspect()
    logger.info('hello', () => {
      inspect.restore()
      assert.include(inspect.output[0], 'hello')
      done()
    })
  })
})
