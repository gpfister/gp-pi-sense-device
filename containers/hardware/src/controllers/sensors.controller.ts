/**
 * GP Pi Sense | A personal take on IoT and HomeKit
 *
 * @author Greg PFISTER
 * @since v0.1.0
 * @copyright (c) 2020, Greg PFISTER. MIT License
 * @license MIT
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { EventEmitter } from "events";
import { Logger } from "log4js";
import { GPSensorData } from "../models/sensor_data.model";
import { GPHTS221Controller } from "./hts221.controller";
import { GPLPS25HController } from "./lps25h.controller";

export class GPSensorsController extends EventEmitter {
  private _logger: Logger;

  private _hts221Controller: GPHTS221Controller;
  private _lps25hController: GPLPS25HController;

  private _isHTS221Ready = false;
  private _isLPS25HReady = false;

  constructor(logger: Logger) {
    super();

    this._logger = logger;
    this._hts221Controller = new GPHTS221Controller(this._logger);
    this._hts221Controller.on('ready', () => {
      this._isHTS221Ready = true;
      if (this.areSensorsReady) this.emit('ready');
    });
    this._lps25hController = new GPLPS25HController(this._logger);
    this._lps25hController.on('ready', () => {
      this._isLPS25HReady = true;
      if (this.areSensorsReady) this.emit('ready');
    });
  }

  async readSensorData(): Promise<GPSensorData> {

    const lps25hData = await this._lps25hController.readData();
    const hts221Data = await this._hts221Controller.readData();

    return {
      pressure: Math.floor(lps25hData.pressure * 10) / 10,
      temperatureFromPressure: Math.floor(lps25hData.temperatureFromPressure * 10) / 10,
      temperatureFromHumidity: Math.floor(hts221Data.temperatureFromHumidity * 10) / 10,
      humidity: Math.floor(hts221Data.humidity * 10) / 10,
      timestamp: new Date()
    };
  }

  get areSensorsReady() {
    return this._isLPS25HReady && this._isHTS221Ready;
  }
}