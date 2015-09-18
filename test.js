/* jshint node:true, mocha:true */
"use strict";


var wd = require("wd"),
    _ = require('underscore'),
    chai = require("chai"),
    chaiAsPromised = require("chai-as-promised"),
    _p = require('./promise_utils');

require('colors'); 
chai.use(chaiAsPromised);
var should = chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var testApp = "/Users/muratsu/Git/appium_test/clickr.app";

function logger(driver) {
  // See whats going on
  driver.on('status', function (info) {
    console.log(info.cyan);
  });
  driver.on('command', function (meth, path, data) {
    console.log(' > ' + meth.yellow, path.grey, data || '');
  });
  driver.on('http', function (meth, path, data) {
    console.log(' > ' + meth.magenta, path, (data || '').grey);
  });
}

describe("ios webview", function () {
  this.timeout(300000);
  var driver;
  var allPassed = true;

  before(function () {
    var serverConfig = {
      host: 'localhost',
      port: 4723
    };
    driver = wd.promiseChainRemote(serverConfig);
    logger(driver);

    var desired = {
      browserName: '',
      'appium-version': '1.4',
      platformName: 'iOS',
      platformVersion: '8.4',
      deviceName: 'iPhone',
      udid: 'Some UDID',
      app: testApp
    };
    return driver.init(desired);
  });

  after(function () {
    return driver
      .quit()
      .finally(function () {});
  });

  afterEach(function () {
    allPassed = allPassed && this.currentTest.state === 'passed';
  });


  it("camera pic", function () {
    var slider;
    return driver
      // Change Slider Value
      .elementByClassName("UIASlider")
        .then(function (_slider) { slider = _slider; })
        // change value
        .then(function () { return slider.setImmediateValue("324"); })
        .then(function () {
          return slider.getValue().should.become('324');
        })
      // 20 = prev, 21 = shutter, 22 = next
      // prev: //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton[1]
      // shutter: //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton[2]
      // next: //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton[3]
      // .elementByXPath('//UIAButton[@path=\'/0/0/0/0/21\']')
      .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton[2]')
        .click()
        .sleep(1000)
      // camera change: //UIAApplication[1]/UIAWindow[1]/UIAButton[1]
      // retake: //UIAApplication[1]/UIAWindow[1]/UIAButton[2]
      // play: //UIAApplication[1]/UIAWindow[1]/UIAButton[3]
      // usephoto: //UIAApplication[1]/UIAWindow[1]/UIAButton[4]
      // cancel: //UIAApplication[1]/UIAWindow[1]/UIAButton[5]
      // photocapture: //UIAApplication[1]/UIAWindow[1]/UIAButton[6]
      .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIAButton[3]')
        .then(function (el) {
          var action = new wd.TouchAction(driver);
          action
            .tap({el: el, x: 5, y: 5})
            .release();
          return driver.performTouchAction(action);
        })
        .sleep(5000)
      .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIAButton[4]')
        .then(function (el) {
          var action = new wd.TouchAction(driver);
          action
            .tap({el: el, x: 5, y: 5})
            .release();
          return driver.performTouchAction(action);
        })
        .sleep(5000);
  });

});