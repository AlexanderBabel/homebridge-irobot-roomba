const Local = require('dorita980').Local;

const pluginName = 'homebridge-irobot-roomba';
const platformName = 'Roomba';

let Service;
let Characteristic;
let Accessory;
let UUIDGen;

function Roomba(log, config, api) {
  const platform = this;
  platform.log = log;
  platform.accessories = [];
  platform.config = config || {};
  platform.config.robots = platform.config.robots || [];

  for (let i = 0; i < platform.config.robots.length; i += 1) {
    platform.config.robots[i] = platform.config.robots[i] || {};
    platform.config.robots[i].name = platform.config.robots[i].name
      || 'iRobot Roomba';
  }

  if (api) {
    platform.api = api;
    platform.api.on('didFinishLaunching', () => {
      platform.log('Cached accessories loaded.');
      if (platform.accessories.length < platform.config.robots.length) {
        for (let i = platform.accessories.length;
          i < platform.config.robots.length; i += 1) {
          platform.addAccessory(i);
        }
      }
    });
  }
}

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  Accessory = homebridge.platformAccessory;
  UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform(pluginName, platformName, Roomba, true);
};

Roomba.prototype.addAccessory = function addAccessory(index) {
  const platform = this;

  const accessoryName = platform.config.robots[index].name;
  const accessory = new Accessory(accessoryName,
    UUIDGen.generate(accessoryName));

  accessory.context = { index };

  platform.log(`Added ${accessoryName}`);
  platform.api.registerPlatformAccessories(pluginName, platformName,
    [accessory]);
  platform.configureAccessory(accessory);
};

Roomba.prototype.configureAccessory = function configureAccessory(accessory) {
  const platform = this;

  platform.accessories.push(accessory);

  const index = accessory.context.index;
  if (!platform.config.robots[index]) {
    platform.removeAccessory(accessory.displayName);
    return;
  }

  if (platform.config.robots[index].name !== accessory.displayName) {
    platform.removeAccessory(accessory.displayName);
    platform.addAccessory(index);
    return;
  }

  const config = platform.config.robots[index];
  if (!(config.address && config.password && config.blid)) {
    platform.log(`The config of ${accessory.displayName
      } is not complete. Please look in the readme of this plugin!`);
    return;
  }

  accessory.service = function service(serviceName) {
    if (this.getService(serviceName)) {
      return this.getService(serviceName);
    }
    return this.addService(serviceName);
  };

  accessory.context.address = config.address;
  accessory.context.blid = config.blid;
  accessory.context.password = config.password;

  accessory.service(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'iRobot')
    .setCharacteristic(Characteristic.Model, 'Roomba')
    .setCharacteristic(Characteristic.SerialNumber, config.address);

  if (accessory.getService(Service.Switch)) {
    accessory.removeService(accessory.getService(Service.Switch));
  }

  accessory.service(Service.Fan)
    .getCharacteristic(Characteristic.On)
    .on('get', async (callback) => {
      try {
        await platform.connect(accessory);
        const status = await platform.getStatus(accessory);
        callback(null, status === 'run' ? 1 : 0);
      } catch (err) {
        callback(err);
      }
    })
    .on('set', async (toggle, callback) => {
      try {
        await platform.connect(accessory);
        await platform.setStatus(accessory, toggle);
        callback();
      } catch (err) {
        callback(err);
      }
    });

  platform.log(`Loaded accessory ${accessory.displayName}`);
};

Roomba.prototype.removeAccessory = function removeAccessory(name) {
  const platform = this;

  platform.log(`Removing accessory ${name}`);
  const remainingAccessories = [];
  const removedAccessories = [];

  for (let i = 0; i < platform.accessories.length; i += 1) {
    if (platform.accessories[i].displayName === name) {
      removedAccessories.push(platform.accessories[i]);
    } else {
      remainingAccessories.push(platform.accessories[i]);
    }
  }

  if (removedAccessories.length > 0) {
    platform.api.unregisterPlatformAccessories(pluginName, platformName,
      removedAccessories);
    platform.accessories = remainingAccessories;
    platform.log(`${removedAccessories.length} accessories removed.`);
  }
};


Roomba.prototype.getStatus = function getStatus(accessory) {
  const platform = this;
  return new Promise((resolve, reject) => {
    accessory.connection.getMission().then((response) => {
      accessory.service(Service.BatteryService)
        .setCharacteristic(Characteristic.BatteryLevel, response.batPct)
        .setCharacteristic(Characteristic.ChargingState,
          response.cleanMissionStatus.phase === 'charge' ? 1 : 0);

      resolve(response.cleanMissionStatus.phase);
    }).catch((err) => {
      platform.log(`${accessory.displayName} Failed: %s`, err.message);
      reject(err);
    });
  });
};

Roomba.prototype.setStatus = function setStatus(accessory, toggle) {
  const platform = this;
  return new Promise((resolve, reject) => {
    if (toggle) {
      accessory.connection.start().then(() => {
        platform.log(`Started ${accessory.displayName}`);
        resolve(true);
      }).catch((err) => {
        platform.log(`${accessory.displayName} Failed: %s`, err.message);
        reject(err);
      });
    } else {
      accessory.connection.pause().then(() => {
        accessory.connection.dock().then((() => {
          resolve();
          platform.log(`Stopped ${accessory.displayName}`);
        })).catch((err) => {
          platform.log(`${accessory.displayName} Failed: %s`, err.message);
          reject(err);
        });
      }).catch((err) => {
        platform.log(`${accessory.displayName} Failed: %s`, err.message);
        reject(err);
      });
    }
  });
};

/* eslint max-len: ["error", { "ignoreComments": true }] no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["accessory"] }] */
Roomba.prototype.connect = async function connect(accessory) {
  if (accessory.connection) {
    return accessory.connection;
  }

  const { blid, password, address } = accessory.context;
  const connection = new Local(blid, password, address);

  connection.on('end', () => {
    accessory.connection = null;
  });

  return new Promise((resolve, reject) => {
    connection.on('connect', () => {
      accessory.connection = connection;
      setTimeout(() => connection.end(), 30000);
      resolve();
    });

    setTimeout(() => {
      if (!accessory.connection) {
        reject(new Error(`Could not connect to ${accessory.displayName}`));
      }
    }, 25000);
  });
};
