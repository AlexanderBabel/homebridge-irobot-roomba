# homebridge-roomba

homebridge-plugin for Roomba980  
[![homebridge-plugin for Roomba980](http://img.youtube.com/vi/BbHbArJ95g0/0.jpg)](https://www.youtube.com/watch?v=BbHbArJ95g0)


# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-roomba
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Configuration
Configuration sample:

```
"accessories": [
    "accessories": [
    {
        "accessory": "Roomba",
        "name": "Roomba",
        "blid":"0123456789abcdef",
        "robotpwd":"abcdefghijklmnop"
    }
]
```
