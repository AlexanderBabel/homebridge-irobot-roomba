# homebridge-roomba

[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/homebridge-roomba.svg
[npm-url]: https://www.npmjs.com/package/homebridge-roomba

homebridge-plugin for Roomba980(Roomba 900 Software Version 2.x).

[![homebridge-plugin for Roomba980](https://cloud.githubusercontent.com/assets/3190760/25561826/ac495bda-2dae-11e7-96be-e7d8409e2901.gif)](https://www.youtube.com/watch?v=BbHbArJ95g0)

# Installation

## 1. Installation
```bash
npm install -g homebridge-roomba
```

## 2. Confirm the IP address to which Roomba is connected with the official application.
- 2-1. Open the `iRobot HOME App`.
- 2-2. Select  More ➔  Settings ➔ Wi-Fi Settings ➔ Details of robot's Wi-Fi
- 2-3. Check IP Address items. (example: 192.168.xx.xx)

## 3. Get robotpwd and blid.
- 3-1. Move to the directory where you installed your node modules.  
     (example path `/ust/local/lib/node_modules`)
- 3-2. Go in the `dorita980` directory and run
- 3-2. `npm run getpassword <Roomba IP address>`
- 3-3. Follow the displayed message.
```
Make sure your robot is on the Home Base and powered on (green lights on).
Then press and hold the HOME button on your robot until it plays a series of tones (about 2 seconds).
Release the button and your robot will flash WIFI light.
Then press any key here...
```

This process often fails.
Please check the following points and try several times.

- Is the environment installing Rumba and homebridge connected to the same wifi?
- Is Rumba in the Dock and in a charged state?
- Please try running "npm run getrobotpwd 192.16.xx.xx" after the sound has sounded after pressing the home button of the room for 2 seconds
- Please check the version of Node.js. I confirmed that it works with "v 7.7.1".

If successful, the following message will be displayed.
Please check "blid" and "Password" of displayed message.

```
Robot Data:
{ ver: '2',
  hostname: 'Roomba-xxxxxxxxxxxxxxxx',
  robotname: 'Your Roomba’s Name',
  ip: '192.168.xx.xx',
  mac: 'xx:xx:xx:xx:xx:xx',
  sw: 'vx.x.x-x',
  sku: 'R98----',
  nc: 0,
  proto: 'mqtt',
  blid: '0123456789abcdef' }
Password=> :1:2345678910:ABCDEFGHIJKLMNOP <= Yes, all this string.
```

blid is `0123456789abcdef`.
robotpwd is `:1:2345678910:ABCDEFGHIJKLMNOP`.

## 4. Update homebridge configuration file.
```json
  {
    "platform": "Roomba",
    "name": "Roomba",
      "robots": [
        {
          "name": "Name of the robot in the Home app",
          "blid":"123456789abcdefg",
          "password": ":1:2345678901:ABCDEFGHIJKLMNOP",
          "address": "192.168.x.xx"
        }
      ]
  }
```
