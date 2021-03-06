'use strict'

/*
 * adonis-framework
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('@adonisjs/fold')

class AppProvider extends ServiceProvider {
  /**
   * Registering the env provider under
   * Adonis/Src/Env namespace.
   *
   * @method _registerEnv
   *
   * @return {void}
   *
   * @private
   */
  _registerEnv () {
    this.app.singleton('Adonis/Src/Env', (app) => {
      const Helpers = app.use('Adonis/Src/Helpers')
      const Env = require('../src/Env')
      return new Env(Helpers.appRoot())
    })
    this.app.alias('Adonis/Src/Env', 'Env')
  }

  /**
   * Registering the config provider under
   * Adonis/Src/Config namespace
   *
   * @method _registerConfig
   *
   * @return {void}
   *
   * @private
   */
  _registerConfig () {
    this.app.singleton('Adonis/Src/Config', (app) => {
      const Helpers = app.use('Adonis/Src/Helpers')
      const Config = require('../src/Config')
      return new Config(Helpers.configPath())
    })
    this.app.alias('Adonis/Src/Config', 'Config')
  }

  /**
   * Registering the request provider under
   * Adonis/Src/Request namespace
   *
   * @method _registerRequest
   *
   * @return {void}
   *
   * @private
   */
  _registerRequest () {
    this.app.bind('Adonis/Src/Request', () => {
      return require('../src/Request')
    })
  }

  /**
   * Registering the response provider under
   * Adonis/Src/Response namespace
   *
   * @method _registerResponse
   *
   * @return {void}
   *
   * @private
   */
  _registerResponse () {
    this.app.bind('Adonis/Src/Response', () => {
      return require('../src/Response')
    })
  }

  /**
   * Registering the route provider under
   * Adonis/Src/Route namespace
   *
   * @method _registerRoute
   *
   * @return {void}
   *
   * @private
   */
  _registerRoute () {
    this.app.singleton('Adonis/Src/Route', () => {
      return require('../src/Route/Manager')
    })
    this.app.alias('Adonis/Src/Route', 'Route')
  }

  /**
   * Registers the logger provider under
   * Adonis/Src/Logger namespace
   *
   * @method _registerLogger
   *
   * @return {void}
   */
  _registerLogger () {
    this.app.singleton('Adonis/Src/Logger', (app) => {
      const LoggerManager = require('../src/Logger/Manager')
      return new LoggerManager(app.use('Adonis/Src/Config'))
    })
    this.app.alias('Adonis/Src/Logger', 'Logger')
  }

  /**
   * Register the server provider under
   * Adonis/Src/Server namespace.
   *
   * @method _registerServer
   *
   * @return {void}
   *
   * @private
   */
  _registerServer () {
    this.app.singleton('Adonis/Src/Server', (app) => {
      const Context = app.use('Adonis/Src/HttpContext')
      const Route = app.use('Adonis/Src/Route')
      const Exception = app.use('Adonis/Src/Exception')
      const Logger = app.use('Adonis/Src/Logger')
      const Server = require('../src/Server')
      return new Server(Context, Route, Logger, Exception)
    })
    this.app.alias('Adonis/Src/Server', 'Server')
  }

  /**
   * Registers the hash provider
   *
   * @method _registerHash
   *
   * @return {void}
   *
   * @private
   */
  _registerHash () {
    this.app.singleton('Adonis/Src/Hash', () => {
      return require('../src/Hash')
    })
    this.app.alias('Adonis/Src/Hash', 'Hash')
  }

  /**
   * Register the context provider
   *
   * @method _registerContext
   *
   * @return {void}
   *
   * @private
   */
  _registerContext () {
    this.app.bind('Adonis/Src/HttpContext', () => {
      return require('../src/Context')
    })
    this.app.alias('Adonis/Src/HttpContext', 'HttpContext')
  }

  /**
   * Register the static resource middleware provider
   *
   * @method _registerStaticMiddleware
   *
   * @return {void}
   *
   * @private
   */
  _registerStaticMiddleware () {
    this.app.bind('Adonis/Middleware/Static', (app) => {
      const Static = require('../src/Static')
      return Static(app.use('Adonis/Src/Helpers'), app.use('Adonis/Src/Config'))
    })
  }

  /**
   * Registers the exceptions provider
   *
   * @method _registerException
   *
   * @return {void}
   */
  _registerException () {
    this.app.singleton('Adonis/Src/Exception', () => {
      return require('../src/Exception')
    })
    this.app.alias('Adonis/Src/Exception', 'Exception')
  }

  /**
   * Register the exception handler
   *
   * @method _registerExceptionHandler
   *
   * @return {void}
   *
   * @private
   */
  _registerExceptionHandler () {
    this.app.bind('Adonis/Exceptions/Handler', () => {
      return new (require('../src/App/Handler'))()
    })
  }

  /**
   * Register the encryption provider
   *
   * @method _registerEncryption
   *
   * @return {void}
   */
  _registerEncryption () {
    this.app.singleton('Adonis/Src/Encryption', (app) => {
      const Encryption = require('../src/Encryption')
      return new Encryption(app.use('Adonis/Src/Config'))
    })
    this.app.alias('Adonis/Src/Encryption', 'Encryption')
  }

  /**
   * Registers the event provider under `Adonis/Src/Event`
   * namespace.
   *
   * @method _registerEvent
   *
   * @return {void}
   */
  _registerEvent () {
    this.app.singleton('Adonis/Src/Event', (app) => {
      const Event = require('../src/Event')
      return new Event(app.use('Adonis/Src/Config'))
    })
    this.app.alias('Adonis/Src/Event', 'Event')
  }

  /**
   * Registers a hash trait to be used while running
   * tests, which simply binds the hash mock
   * to the ioc container.
   *
   * @method _registerHashTrait
   *
   * @return {void}
   *
   * @private
   */
  _registerHashTrait () {
    this.app.bind('Adonis/Traits/Hash', () => require('../src/Traits/Hash'))
  }

  /**
   * Register all the required providers
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this._registerEnv()
    this._registerConfig()
    this._registerContext()
    this._registerRequest()
    this._registerResponse()
    this._registerRoute()
    this._registerLogger()
    this._registerServer()
    this._registerHash()
    this._registerException()
    this._registerExceptionHandler()
    this._registerEncryption()
    this._registerStaticMiddleware()
    this._registerEvent()
    this._registerHashTrait()
  }

  /**
   * The boot method called by Ioc container to
   * boot the providers
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    const Context = this.app.use('Adonis/Src/HttpContext')
    const Request = this.app.use('Adonis/Src/Request')
    const Response = this.app.use('Adonis/Src/Response')

    /**
     * Gets the provider load the env file.
     */
    this.app.use('Adonis/Src/Env')

    Context.getter('request', function () {
      return new Request(this.req, this.res, use('Adonis/Src/Config'))
    }, true)

    Context.getter('response', function () {
      return new Response(this.req, this.res, use('Adonis/Src/Config'))
    }, true)
  }
}

module.exports = AppProvider
