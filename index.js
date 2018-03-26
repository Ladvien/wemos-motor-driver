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

    const firstByte     = (pwmFreq >> 24) &~ 0xFFFFFF00;
    const secondByte    = (pwmFreq >> 16) &~ 0xFFFFFF00;
    const thirdByte     = (pwmFreq >> 8) &~ 0xFFFFFF00;
    const fourthByte    = pwmFreq &~ 0xFFFFFF00;

    console.log(`
    address: ${_address.toString(16)}
    firstByte: ${firstByte.toString(16)}
    secondByte: ${secondByte.toString(16)}
    thirdByte: ${thirdByte.toString(16)}
    fourthByte: ${fourthByte.toString(16)}
        `)

    var buf = Buffer.from([firstByte, secondByte, thirdByte, fourthByte]);
    var bytesWritten = i2c1.i2cWriteSync(_address, buf.length, buf);
    console.log(`Wrote ${bytesWritten} bytes setting PWM frequency.`)
    sleep.msleep(100);
}

var setMotor = function(motor, direction, pwmValue) {

    const motorSelection = (motor | 0x10) &~ 0xFFFFFF00;;
    const directionSelection = (direction);
    var pwmValueCalculation = pwmValue * 100
    if (pwmValueCalculation > 10000) {
        pwmValueCalculation = 10000;
    }
    const pwmValueSelectionOne = (pwmValueCalculation >> 8) &~ 0xFFFFFF00;;
    const pwmValueSelectionTwo = pwmValueCalculation &~ 0xFFFFFF00;

    console.log(`
    address: ${_address.toString(16)}
    motorSelection: ${motorSelection.toString(16)}
    direction: ${direction.toString(16)}
    pwmValueSelectionOne: ${pwmValueSelectionOne.toString(16)}
    pwmValueSelectionTwo: ${pwmValueSelectionTwo.toString(16)}
        `)


    var buf = Buffer.from([motorSelection, direction, pwmValueSelectionOne, pwmValueSelectionTwo]);
    i2c1.i2cWriteSync(_address, buf.length, buf);
    sleep.msleep(100);
}

init(0x2D, _MOTOR_A, 1000, 0);
setMotor(_MOTOR_A, _CW, 100.0);