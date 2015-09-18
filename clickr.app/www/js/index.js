/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    onDeviceReady: function() {
        log.log('deviceready');
        
        var title = document.getElementById('title');
        var index = 0;
        
        var prevButton = document.getElementById('prev');
        var nextButton = document.getElementById('next');
        
        var screenWidth = window.innerWidth;
        var screenHeight = window.innerHeight;
        
        var cameraOptions = {
        	quality : [0, 100],
        	destinationType : [
                navigator.camera.DestinationType.DATA_URL, 
                navigator.camera.DestinationType.FILE_URI, 
                navigator.camera.DestinationType.NATIVE_URI
            ],
        	sourceType : [
                navigator.camera.PictureSourceType.PHOTOLIBRARY,
                navigator.camera.PictureSourceType.CAMERA,
                navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
            ],
        	allowEdit : [true, false],
        	encodingType : [
                navigator.camera.EncodingType.JPEG,
                navigator.camera.EncodingType.PNG
            ],
        	targetWidth : [screenWidth],
        	targetHeight : [screenHeight],
        	popoverOptions : [true, false],
        	saveToPhotoAlbum : [true, false],
            correctOrientation : [true, false],
            cameraDirection : [
                navigator.camera.Direction.BACK,
                navigator.camera.Direction.FRONT
            ]
        }
        
        // Popover options are iOS only
        if (device.platform !== "iOS") {
            cameraOptions.popoverOptions = ["N/A"];
        }
        
        // On Android PHOTOLIBRARY and SAVEDPHOTOALBUM are the same
        if (device.platform === "Android") {
            cameraOptions.sourceType = [
                navigator.camera.PictureSourceType.PHOTOLIBRARY,
                navigator.camera.PictureSourceType.CAMERA
            ];
            cameraOptions.cameraDirection = ["N/A"];
        }
        
        // Prune options Windows Phone ignores
        if (device.platform === "WinCE" ||
            device.platform === "Win32NT") {
                cameraOptions.allowEdit = ["N/A"];
                cameraOptions.correctOrientation = ["N/A"];
                cameraOptions.cameraDirection = ["N/A"];
                cameraOptions.saveToPhotoAlbum = ["N/A"];
            }
        
        var cameraScenarios = [];
        
        cameraOptions["quality"].forEach(function(quality) {
        	cameraOptions["destinationType"].forEach(function(destinationType) {
        		cameraOptions["sourceType"].forEach(function(sourceType) {
                    
                    if (sourceType === navigator.camera.PictureSourceType.CAMERA) {
                        cameraOptions.correctOrientation = [true, false];
                        if (device.platform !== "Android") {
                            cameraOptions.cameraDirection = [
                                navigator.camera.Direction.BACK,
                                navigator.camera.Direction.FRONT
                            ];
                        }
                    }
                    else {
                        cameraOptions.correctOrientation = ["N/A"];
                        cameraOptions.cameraDirection = ["N/A"];
                    }
                    
        			cameraOptions["allowEdit"].forEach(function(allowEdit) {
        				cameraOptions["encodingType"].forEach(function(encodingType) {
        					cameraOptions["targetWidth"].forEach(function(targetWidth) {
        						cameraOptions["targetHeight"].forEach(function(targetHeight) {
        							cameraOptions["popoverOptions"].forEach(function(popoverOptions) {
        								cameraOptions["saveToPhotoAlbum"].forEach(function(saveToPhotoAlbum) {
                                            cameraOptions["correctOrientation"].forEach(function(correctOrientation) {
                                                cameraOptions["cameraDirection"].forEach(function(cameraDirection) {
                                                    var scenario = {
                                                        quality : quality,
                                                        destinationType : destinationType,
                                                        sourceType : sourceType,
                                                        allowEdit : allowEdit,
                                                        encodingType : encodingType,
                                                        targetWidth : targetWidth,
                                                        targetHeight : targetHeight,
                                                        popoverOptions : popoverOptions,
                                                        saveToPhotoAlbum : saveToPhotoAlbum,
                                                        correctOrientation : correctOrientation,
                                                        cameraDirection : cameraDirection
                                                    };
                                                    
                                                    cameraScenarios.push(scenario);
                                                });
                                            });
        								})
        							})
        						})
        					})
        				})
        			})
        		})
        	})
        });

        // Cache the photos taken        
        var cachedPhotos = [];
        for (var i = 0; i < cameraScenarios.length; i++) {
            cachedPhotos[i] = "";
        }
        
        // Grab DOM elements
        var qualityText = document.getElementById('qualityField');
        var destinationTypeText = document.getElementById('destinationTypeField');
        var sourceTypeText = document.getElementById('sourceTypeField');
        var allowEditText = document.getElementById('allowEditField');
        var encodingTypeText = document.getElementById('encodingTypeField');
        var popoverOptionsText = document.getElementById('popoverOptionsField');
        var saveToPhotoAlbumText = document.getElementById('saveToPhotoAlbumField');
        var correctOrientationText = document.getElementById('correctOrientationField');
        var cameraDirectionText = document.getElementById('cameraDirectionField');
        var img = document.getElementById('previewImage');
        var slider = document.getElementById('caseSlider');
        var shutter = document.getElementById('shutter');
        
        prevButton.onclick = function() {
            if (index > 0) {
                index -= 1;
                updatePicture();
                updateDisplay();
            }
        }
        
        nextButton.onclick = function() {
            if (index < cameraScenarios.length - 1) {
                index += 1;
                updatePicture();
                updateDisplay();
            }
        }
        
        var updateDisplay = function() {
            title.innerText = 'Case ' + (index + 1) + "/" + cameraScenarios.length;
            
            qualityText.innerText = cameraScenarios[index].quality;
            destinationTypeText.innerText = toDestinationType(cameraScenarios[index].destinationType);
            sourceTypeText.innerText = toSourceType(cameraScenarios[index].sourceType);
            allowEditText.innerText = cameraScenarios[index].allowEdit;
            encodingTypeText.innerText = toEncodingType(cameraScenarios[index].encodingType);
            popoverOptionsText.innerText = cameraScenarios[index].popoverOptions;
            saveToPhotoAlbumText.innerText = cameraScenarios[index].saveToPhotoAlbum;
            correctOrientationText.innerText = cameraScenarios[index].correctOrientation;
            cameraDirectionText.innerText = toCameraDirection(cameraScenarios[index].cameraDirection);
            
            slider.value = index;
        };
        
        var logHeader = function() {
            log.log(
                "Scenario, " +
                "Quality, " +
                "Destination Type, " +
                "Source Type, " +
                "Allow Edit, " +
                "Encoding Type, " +
                "Popover Options, " +
                "Save To Photo Album, " +
                "Correct Orientation, " +
                "Camera Direction"
            );
        }
        
        var logScenario = function() {
            log.log(
                (index + 1) + "," +
                cameraScenarios[index]["quality"] + ", " +
                toDestinationType(cameraScenarios[index]["destinationType"]) + ", " +
                toSourceType(cameraScenarios[index]["sourceType"]) + ", " +
                cameraScenarios[index]["allowEdit"] + ", " +
                toEncodingType(cameraScenarios[index]["encodingType"]) + ", " +
                cameraScenarios[index]["popoverOptions"] + ", " +
                cameraScenarios[index]["saveToPhotoAlbum"] + ", " +
                cameraScenarios[index]["correctOrientation"] + ", " +
                toCameraDirection(cameraScenarios[index]["cameraDirection"])
            );
        }
        
        var logAllScenarios = function() {
            var currentIndex = index;
            
            for (var i = 0; i < cameraScenarios.length; i++) {
                index = i;
                logScenario();
            }
            
            index = currentIndex;
        }
        
        var toDestinationType = function(val) {
            switch (parseInt(val)) {
                case 0:
                    return "DATA_URL";
                case 1:
                    return "FILE_URI";
                case 2:
                    return "NATIVE_URI";
                default:
                    return val;
            }
        };
        
        var toSourceType = function(val) {
            switch (parseInt(val)) {
            	case 0:
            		return "PHOTOLIBRARY";
            	case 1:
            		return "CAMERA";
            	case 2:
            		return "SAVEDPHOTOALBUM";
                default:
                    return val;
            }
        };
        
        var toEncodingType = function(val) {
            switch (parseInt(val)) {
                case 0:
                    return "JPEG";
                case 1:
                    return "PNG";
                default:
                    return val;
            }
        }
        
        var toCameraDirection = function(val) {
            switch (parseInt(val)) {
                case 0:
                    return "BACK";
                case 1:
                    return "FRONT";
                default:
                    return val;
            }
        };
        
        shutter.onclick = function() {
            navigator.camera.getPicture(
                function(data) {
                    setPicture(data);
                    logScenario();
                },
                function (err) {
                    // shutter.setAttribute('style', 'background:red');
                },
                cameraScenarios[index]
            );
        };
        
        var setPicture = function(url) {
            try {
                window.atob(url);
                url = "data:image/jpeg;base64," + url;
            } catch (e) {
                // console.log('Failed to load image');
            }
    
            cachedPhotos[index] = url;
            img.src = cachedPhotos[index];
            img.onloadend = function () {
                log.log('Image loaded successfully!');
                log.log(img);
            };
        }
        
        var updatePicture = function() {
            img.src = cachedPhotos[index];
        };
        
        slider.max = cameraScenarios.length - 1;
        
        slider.onchange = function (ev) {
            index = parseInt(ev.target.value);
            updatePicture();
            updateDisplay();
        }
        
        updateDisplay();
        logHeader();
        logAllScenarios();
    }
};

function logger(divID) {
    this.target = document.getElementById(divID);
}

logger.prototype.log = function(text) {
    this.target.value += text;
    this.target.value += "\n"; 
};

logger.prototype.clean = function() {
    this.target.value = "";
};

var log = new logger('logbox');

app.initialize();