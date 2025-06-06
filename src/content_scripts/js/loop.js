import { getResourceURL } from "@modules/extension_general_lib.js"

// >>>>>>>
// ---- create element
// <<<<<<<
function createLoopToggleBtn() {
    let loopToggleBtn = document.createElement("div")
    loopToggleBtn.id = "loop-btn"
    loopToggleBtn.classList.add("ytp-button")
    let enabledLoopImg = document.createElement("img")
    enabledLoopImg.id = "enabled-loop"
    enabledLoopImg.src = getResourceURL("assets/features/loop/enabled-loop.png")
    let disabledLoopImg = document.createElement("img")
    disabledLoopImg.id = "disabled-loop"
    disabledLoopImg.src = getResourceURL("assets/features/loop/disabled-loop.png")

    loopToggleBtn.append(enabledLoopImg)
    loopToggleBtn.append(disabledLoopImg)
    return loopToggleBtn
}
function isVideoWhithinCompletionRange(video) {
    return ((video.duration - 0.2) <= video.currentTime)
}
// >>>>>>>
// ---- Add functionality
// <<<<<<<

function replayVideo(video) {
    let replayBtn = document.querySelector("#full-bleed-container .ytp-play-button[data-title-no-tooltip]")
    if (replayBtn) {
        video.currentTime = 0
        replayBtn.click()
        return
    }
    video.pause()
    video.currentTime = 0
    video.play()
}
async function getCurrentPlayingVideo() {
    let currentPlayingVideo = await document.getElement("video[src]")
    return currentPlayingVideo
}
async function addFuncionalityToLoopBtn(loopToggleBtn) {
    loopToggleBtn.addEventListener("click", async () => {
        // let video = await document.getElement("#full-bleed-container video")
        let video = await getCurrentPlayingVideo()
        if (!video.loop) {
            if (isNaN(video.duration) || (isVideoWhithinCompletionRange(video) && video.paused)) {
                replayVideo(video)
            }
            video.loop = true
            loopToggleBtn.classList.add("loop-active")
        } else {
            video.loop = false
            loopToggleBtn.classList.remove("loop-active")
        }
    })
    // let video = await document.getElement("#full-bleed-container video")
    let video = await getCurrentPlayingVideo()
    video.onloadedmetadata = () => {
        if (video.loop) {
            loopToggleBtn.classList.add("loop-active")
        } else {
            loopToggleBtn.classList.remove("loop-active")
        }
    }
}

async function enableLoop() {
    let loopToggleBtn = createLoopToggleBtn()
    addFuncionalityToLoopBtn(loopToggleBtn)
    let videoPlayerRightControls = await document.getElement(".ytp-right-controls")
    videoPlayerRightControls.prepend(loopToggleBtn)
}
async function disableLoop() {
    document.querySelector("#loop-btn").remove()
    let video = await document.getElement("video")
    video.loop = false
}
export default { enableLoop, disableLoop }