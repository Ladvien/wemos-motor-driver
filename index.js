var i2c = require('i2c-bus'), i2c1 = i2c.openSync(1);
var sleep = require('sleep');

const _MOTOR_A      = 0
const _MOTOR_B      = 1

const _SHORT_BRAKE  = 0
const _CCW          = 1
const _CW           = 2
const _STOP         = 3
const _STANDBY      = 4

var _address;
var _motor;
var _usingStandByIO = false;
var _standByIOPin = 0;


var init = function(address, motor, freq, standByIOPin) {
    _usingStandByIO = true;
    _standByIOPin = standByIOPin;

    if (motor === _MOTOR_A) {
        _motor = _MOTOR_A;
    } else if (motor === _MOTOR_B) {
        _motor = _MOTOR_B;
    } else {
        throw "Not a valid motor."
    }

    _address = address;

    setFreq(freq);
}

var setFreq = function(pwmFreq) {

    const firstByte     = (pwmFreq >> 16 & 0x0F);
    const secondByte    = (pwmFreq >> 16);
    const thirdByte     = (pwmFreq >> 8);
    const fourthByte    = pwmFreq;

    var buf = Buffer.from([firstByte, secondByte, thirdByte, fourthByte]);
    i2c1.i2cWrite(_address, buf.length, buf, (err, bytesWritten, buffer) => {
        console.log(bytesWritten);
    });
    sleep.msleep(100);
}

var setMotor = function(motor, direction, pwmValue) {

    const motorSelection = (motor | 0x10);
    var pwmValueCalculation = pwmValue * 100
    if (pwmValueCalculation > 10000) {
        pwmValueCalculation = 10000;
    }
    const pwmValueSelectionOne = pwmValueCalculation >> 8;
    const pwmValueSelectionTwo = pwmValueCalculation;
    var buf = Buffer.from([motorSelection, direction, pwmValueSelectionOne, pwmValueSelectionTwo]);
    i2c1.i2cWrite(_address, buf.length, buf, (err, bytesWritten, buffer) => {
        console.log(`While setting motor ${bytesWritten} were written.`)
    });
    sleep.msleep(100);
}

init(0x2d, _MOTOR_A, 1000, 0);
setMotor(_MOTOR_A, _CW, 50);