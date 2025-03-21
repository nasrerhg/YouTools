import { getResourceURL } from "@modules/extension_general_lib.js"
import { applyGetElement } from "@modules/dom_lib.js"
import { addFeatureBtn, removeFeatureBtn, shortScrolled, initialShortVideo } from "@modules/youtools_lib.js"


applyGetElement()


function createRotationBtn(videoRenderer) {
    let rotationLayersWrapper = document.createElement("div")
    rotationLayersWrapper.id = "rotation-layers-wrapper"

    let leftRotationLayer = document.createElement("div")
    leftRotationLayer.id = "left-rotation"
    let leftRotationLayerImg = document.createElement("img")
    leftRotationLayerImg.src = getResourceURL("assets/features/rotation/left_rotation.png")
    leftRotationLayer.append(leftRotationLayerImg)

    let rightRotationLayer = document.createElement("div")
    rightRotationLayer.id = "right-rotation"
    let rightRotationLayerImg = document.createElement("img")
    rightRotationLayerImg.src = getResourceURL("assets/features/rotation/right_rotation.png")
    rightRotationLayer.append(rightRotationLayerImg)

    let showOptionsLayer = document.createElement("div")
    let showOptionsLayerImg = document.createElement("img")
    showOptionsLayerImg.src = getResourceURL("assets/features/rotation/rotation_options.png")
    showOptionsLayer.append(showOptionsLayerImg)
    showOptionsLayer.id = "show-options"


    rotationLayersWrapper.append(leftRotationLayer)
    rotationLayersWrapper.append(rightRotationLayer)
    rotationLayersWrapper.append(showOptionsLayer)
    return rotationLayersWrapper
}
function addClearScreenBtnToActionBar(videoRenderer) {
    let rotationBtn = createRotationBtn()
    addFunctionalityToRotationSubBtns(rotationBtn, videoRenderer)
    addFeatureBtn(videoRenderer, rotationBtn, "rotation")
}
function addFunctionalityToRotationSubBtns(rotationBtn, videoRenderer) {
    let leftRotationBtn = rotationBtn.querySelector("#left-rotation")
    let rightRotationBtn = rotationBtn.querySelector("#right-rotation")
    let showOptionsBtn = rotationBtn.querySelector("#show-options")

    leftRotationBtn.addEventListener("click", () => {
        rotateVideo(videoRenderer, "left")
        containRotatedShortVideo(videoRenderer)
    })
    rightRotationBtn.addEventListener("click", () => {
        rotateVideo(videoRenderer, "right")
        containRotatedShortVideo(videoRenderer)
    })
    showOptionsBtn.addEventListener("click", () => {
        removeLandscape(videoRenderer)
        resizingShortVideoToPortrait()
    })
}
async function containRotatedVideo(video, container) {
    let videoRotatedHeight = Number(getComputedStyle(video).width.replace("px", ""))
    let containerHeight = Number(getComputedStyle(container).height.replace("px", ""))

    let videoRotatedWidth = Number(getComputedStyle(video).height.replace("px", ""))
    let containerWidth = Number(getComputedStyle(container).width.replace("px", ""))

    let rotatedVideoRatio = videoRotatedWidth / videoRotatedHeight
    let containerRatio = containerWidth / containerHeight

    let root = document.documentElement
    console.log({ rotatedVideoRatio, containerRatio });

    if (rotatedVideoRatio > containerRatio) {
        console.log("adjusting to container height");
        root.style.setProperty("--contained-video-width", `${containerHeight}px`)
    }
    if (rotatedVideoRatio < containerRatio) {
        console.log("adjusting to container width");
        root.style.setProperty("--contained-video-width", `${containerHeight}px`)
        root.style.setProperty("--contained-video-height", `auto`)
    }
}
async function containRotatedShortVideo(videoRenderer) {
    console.log(videoRenderer);

    let container = await videoRenderer.getElement(".player-wrapper")
    let video = await videoRenderer.getElement("video")
    containRotatedVideo(video, container)
}

function onResizeContainRotatedVideo(video, container) {
    window.addEventListener("resize", () => {
        console.log("resizing...");
        containRotatedVideo(video, container)
    })
}
async function onResizeContaineShortVideo(videoRenderer) {
    let container = await videoRenderer.getElement(".player-wrapper")
    let video = await videoRenderer.getElement("video")
    onResizeContainRotatedVideo(video, container)
}

function rotateVideo(videoRenderer, rotationDirection) {
    videoRenderer.classList.add("landscape")
    switch (rotationDirection) {
        case "right":
            videoRenderer.classList.remove("left-rotation")
            videoRenderer.classList.add("right-rotation")
            break;
        case "left":
            videoRenderer.classList.remove("right-rotation")
            videoRenderer.classList.add("left-rotation")
            break;

        default:
            break;
    }
}

function resizingShortVideoToPortrait() {
    let resizeEvent = new Event("resize")
    window.dispatchEvent(resizeEvent)
}

function removeLandscape(videoRenderer) {
    videoRenderer.classList.remove("left-rotation")
    videoRenderer.classList.remove("right-rotation")
    videoRenderer.classList.remove("landscape")
}

export default {
    enableRotation: async () => {
        console.log("rotation :: script activated");
        initialShortVideo((videoRenderer) => {
            addClearScreenBtnToActionBar(videoRenderer)
            onResizeContaineShortVideo(videoRenderer)
        })

        shortScrolled((videoRenderer) => {
            addClearScreenBtnToActionBar(videoRenderer)
            onResizeContaineShortVideo(videoRenderer)
        })

    },
    disableRotation: async () => {
        console.log("rotation :: script deactivated");
        let videoRenderer = await document.getElement("ytd-reel-video-renderer[is-active]")
        removeLandscape(videoRenderer)
        resizingShortVideoToPortrait()
        removeFeatureBtn(videoRenderer, "#rotation-layers-wrapper")
    }
}