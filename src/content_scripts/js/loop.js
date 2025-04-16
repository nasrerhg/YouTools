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

// >>>>>>>
// ---- Add functionality
// <<<<<<<

function replayVideo(video) {
    video.pause()
    video.currentTime = 0
    video.play()
}
function addFuncionalityToLoopBtn(loopToggleBtn) {
    loopToggleBtn.addEventListener("click", async () => {
        let video = await document.getElement("video")
        if (!video.loop) {
            if (video.paused) {
                replayVideo(video)
            }
            video.loop = true
            loopToggleBtn.classList.add("loop-active")
        } else {
            video.loop = false
            loopToggleBtn.classList.remove("loop-active")
        }
    })
}

async function enableLoop() {
    console.log("loop feature starts");
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