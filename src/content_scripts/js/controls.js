import { getResourceURL } from "@modules/extension_general_lib.js"
import { clicksManager } from "@modules/dom_lib.js"
import { createShortScrolledEvent, initialShortVideo } from "@modules/youtools_lib.js"

let videoSkipForwardTimeAmount = 3
let videoSkipBackwardTimeAmount = 3
let videoPlaybackRate = 2





// ---- custom DOM manipulation ---- //
function appendToControlsLayer(controlsLayerElement, element) {
    controlsLayerElement.querySelector("#controls-layer-content").append(element)
}
async function addControlsLayerToVideoRenderer(videoRenderer, controlsLayer) {
    let container = await videoRenderer.getElement("#player-container")
    container.append(controlsLayer)
}
// >>>>>>>
// ---- Creating elements
// <<<<<<<

function createControlsLayer() {
    let controlsLayer = document.createElement("div")
    controlsLayer.id = "controls-layer"
    let controlsLayerContent = document.createElement("div")
    controlsLayerContent.id = "controls-layer-content"
    controlsLayer.append(controlsLayerContent)
    return controlsLayer
}
function createPlayPause() {
    let playPauseContainer = document.createElement("div")
    playPauseContainer.id = "play-pause-container"
    let playPauseContent = document.createElement("div")
    playPauseContent.id = "play-pause-content"
    let playImg = document.createElement("img")
    playImg.id = "play-img"
    playImg.src = getResourceURL("assets/features/controls/play.png")
    let pauseImg = document.createElement("img")
    pauseImg.id = "pause-img"
    pauseImg.src = getResourceURL("assets/features/controls/pause.png")

    playPauseContent.append(playImg)
    playPauseContent.append(pauseImg)
    playPauseContainer.append(playPauseContent)
    return playPauseContainer
}
function createSkipForward() {
    let skipForwardContainer = document.createElement("div")
    skipForwardContainer.id = "skip-forward-container"
    skipForwardContainer.classList.add("skip-container")
    let skipForwardContent = document.createElement("div")
    skipForwardContent.classList.add("skip-container-content")
    let skipForwardImgContainer = document.createElement("div")
    skipForwardImgContainer.classList.add("skip-img-container")
    for (let index = 0; index < 3; index++) {
        let forwardImg = document.createElement("img")
        forwardImg.src = getResourceURL("assets/features/controls/forward-skip.png")
        skipForwardImgContainer.append(forwardImg)
    }
    let skipForwardTimeAmount = document.createElement("div")
    skipForwardTimeAmount.classList.add("skip-time-amount")
    skipForwardContent.append(skipForwardImgContainer)
    skipForwardContent.append(skipForwardTimeAmount)
    skipForwardContainer.append(skipForwardContent)
    return skipForwardContainer
}
function createSkipBackward() {
    let skipBackwardContainer = document.createElement("div")
    skipBackwardContainer.id = "skip-backward-container"
    skipBackwardContainer.classList.add("skip-container")
    let skipBackwardContent = document.createElement("div")
    skipBackwardContent.classList.add("skip-container-content")
    let skipBackwardImgContainer = document.createElement("div")
    skipBackwardImgContainer.classList.add("skip-img-container")
    for (let index = 0; index < 3; index++) {
        let backwardImg = document.createElement("img")
        backwardImg.src = getResourceURL("assets/features/controls/backward-skip.png")
        skipBackwardImgContainer.append(backwardImg)
    }
    let skipBackwardTimeAmount = document.createElement("div")
    skipBackwardTimeAmount.classList.add("skip-time-amount")
    skipBackwardContent.append(skipBackwardImgContainer)
    skipBackwardContent.append(skipBackwardTimeAmount)
    skipBackwardContainer.append(skipBackwardContent)
    return skipBackwardContainer
}
function createFastForward() {
    let fastForwardContainer = document.createElement("div")
    fastForwardContainer.id = "fast-forward-container"
    let fastForwardImgContainer = document.createElement("div")
    fastForwardImgContainer.classList.add("fast-forward-img-container")
    for (let index = 0; index < 3; index++) {
        let forwardImg = document.createElement("img")
        forwardImg.src = getResourceURL("assets/features/controls/forward-skip.png")
        fastForwardImgContainer.append(forwardImg)
    }
    let fastForwardRateDisplay = document.createElement("div")
    fastForwardRateDisplay.id = "fast-forward-rate"
    fastForwardRateDisplay.textContent = "x1"
    fastForwardContainer.append(fastForwardRateDisplay)
    fastForwardContainer.append(fastForwardImgContainer)
    return fastForwardContainer
}
// >>>>>>>
// ---- Adding functionalities
// <<<<<<<

function videoPausePlay(video) {
    if (video.paused) {
        video.play()
    } else {
        video.pause()
    }
}
function videoPausePlayAnimation(video, controlsLayer) {
    if (video.paused) {
        controlsLayer.classList.remove("play")
        controlsLayer.classList.add("pause")
    } else {
        controlsLayer.classList.remove("pause")
        controlsLayer.classList.add("play")
    }
}
// 
function videoSkipForward(video, videoSkipForwardTimeAmount) {
    video.currentTime += videoSkipForwardTimeAmount
}
function videoSkipForwardAnimation(controlsLayer, skipForwardTimeAmount) {
    controlsLayer.classList.add("skip-forward")
    controlsLayer.querySelector("#skip-forward-container .skip-time-amount").textContent = `${skipForwardTimeAmount}s`
    controlsLayer.addEventListener("animationend", () => {
        controlsLayer.classList.remove("skip-forward")
    })
}
// 
function videoSkipBackward(video, videoSkipBackwardTimeAmount) {
    video.currentTime -= videoSkipBackwardTimeAmount
}
function videoSkipBackwordAnimation(controlsLayer, skipBackwardTimeAmount) {
    controlsLayer.classList.add("skip-backward")
    controlsLayer.querySelector("#skip-backward-container .skip-time-amount").textContent = `${skipBackwardTimeAmount}s`
    controlsLayer.addEventListener("animationend", () => {
        controlsLayer.classList.remove("skip-backward")
    })
}
// 
function setVideoFastForward(video, videoPlaybackRate) {
    let initialVideoPauseState = video.paused
    let initialVideoRate = video.playbackRate

    return {
        start: () => {
            initialVideoRate = video.playbackRate
            initialVideoPauseState = video.paused
            if (video.paused) {
                video.play()
            }
            video.playbackRate = videoPlaybackRate
        },
        end: () => {
            if (initialVideoPauseState) {
                video.pause()
            }
            video.playbackRate = initialVideoRate
        }
    }
}
function setVideoFastForwardAnimation(controlsLayer, videoPlaybackRate) {
    let nextAnimationTimeout
    let animationEnded = false
    return {
        start: () => {
            animationEnded = false
            controlsLayer.querySelector("#fast-forward-container #fast-forward-rate").textContent = `x${videoPlaybackRate}`
            controlsLayer.classList.add("fast-forward")
            controlsLayer.addEventListener("animationend", () => {
                controlsLayer.classList.remove("fast-forward")
                controlsLayer.animation = 'none';
                controlsLayer.offsetHeight;
                controlsLayer.animation = null;
                if (animationEnded) {
                    return
                }
                controlsLayer.classList.add("fast-forward")
            })
        },
        end: () => {
            animationEnded = true
            clearTimeout(nextAnimationTimeout)
            controlsLayer.classList.remove("fast-forward")
        }
    }
}
// 
function clickSideIdentifier(event, callback) {
    let eventTarget = event.target
    let eventTargetWidth = Number(getComputedStyle(eventTarget).width.replace("px", ""))
    let eventTargetXCenter = eventTargetWidth / 2

    if (event.offsetX > eventTargetXCenter) {
        callback("rightSide")
    }
    if (event.offsetX < eventTargetXCenter) {
        callback("leftSide")
    }
}
// 
async function addFuncionalityToControlsLayer(videoRenderer, controlsLayer) {
    let video = await videoRenderer.getElement("video")
    let controlsLayerEvents = clicksManager(controlsLayer)
    controlsLayerEvents.onSingleClick((event) => {
        videoPausePlay(video)
        videoPausePlayAnimation(video, controlsLayer)
    })
    controlsLayerEvents.onDoubleClick((event) => {
        clickSideIdentifier(event, (side) => {
            if (side === "leftSide") {
                videoSkipBackward(video, videoSkipBackwardTimeAmount)
                videoSkipBackwordAnimation(controlsLayer, videoSkipBackwardTimeAmount)
            }
            if (side === "rightSide") {
                videoSkipForward(video, videoSkipForwardTimeAmount)
                videoSkipForwardAnimation(controlsLayer, videoSkipForwardTimeAmount)
            }
        })
    })

    let videoFastForward = setVideoFastForward(video, videoPlaybackRate)
    let videoFastForwardAnimation = setVideoFastForwardAnimation(controlsLayer, videoPlaybackRate)

    controlsLayerEvents.onLongMouseDownStart((event) => {
        videoFastForward.start()
        videoFastForwardAnimation.start()
    })
    controlsLayerEvents.onLongMouseDownEnd((event) => {
        videoFastForward.end()
        videoFastForwardAnimation.end()
    })

    document.onkeyup = (event) => {
        let keyCode = event.code
        if (keyCode === "ArrowLeft") {
            videoSkipBackward(video, videoSkipBackwardTimeAmount)
            videoSkipBackwordAnimation(controlsLayer, videoSkipBackwardTimeAmount)
        }
        if (keyCode === "ArrowRight") {
            videoSkipForward(video, videoSkipForwardTimeAmount)
            videoSkipForwardAnimation(controlsLayer, videoSkipForwardTimeAmount)
        }
    }

}
// >>>>>>>
// ---- Implementing feature
// <<<<<<<

function implementControlsOnVideoRenderer(videoRenderer) {
    if (videoRenderer.querySelector("#controls-layer")) {
        console.debug("[ Controls ] \n controls layer already added");
        return
    }
    // create controls layer & its elements (animations)
    let controlsLayer = createControlsLayer()
    let playPauseContainer = createPlayPause()
    let skipForwardContainer = createSkipForward()
    let skipBackwardContainer = createSkipBackward()
    let fastForwardContainer = createFastForward()
    // adding the animation elements to controlsLayer
    appendToControlsLayer(controlsLayer, playPauseContainer)
    appendToControlsLayer(controlsLayer, skipForwardContainer)
    appendToControlsLayer(controlsLayer, skipBackwardContainer)
    appendToControlsLayer(controlsLayer, fastForwardContainer)
    // add functionality to controlsLayer
    addFuncionalityToControlsLayer(videoRenderer, controlsLayer)
    // add controls layer to the video renderer
    addControlsLayerToVideoRenderer(videoRenderer, controlsLayer)
}

let shortScrolled = createShortScrolledEvent();

function enableControls() {
    initialShortVideo((videoRenderer) => {
        implementControlsOnVideoRenderer(videoRenderer)
    })
    shortScrolled.start((videoRenderer) => {
        implementControlsOnVideoRenderer(videoRenderer)
    })
}

async function disableControls() {
    shortScrolled.end()
    let videoRenderer = await document.getElement("ytd-reel-video-renderer[is-active]")
    let controlsLayer = videoRenderer.querySelector("#controls-layer")
    controlsLayer?.remove()
}

export default { enableControls, disableControls }