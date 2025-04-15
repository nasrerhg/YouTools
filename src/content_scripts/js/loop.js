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
function autoReplaySequence(video) {
    let adContainer = document.querySelector(".video-ads.ytp-ad-module")
    if (adContainer && getComputedStyle(adContainer).display !== 'none') {
        console.log("advertisement detected !")
        return
    }
    console.log("pause : ", video.currentTime);
    console.log(video.duration);
    if ((video.duration - 0.2) <= video.currentTime) {
        video.currentTime = 0
        video.play()
    }
}
function addFuncionalityToLoopBtn(loopToggleBtn) {
    loopToggleBtn.addEventListener("click", async () => {
        let video = await document.getElement("video")
        if (!video.onpause) {
            if ((video.duration - 0.2) <= video.currentTime) {
                video.currentTime = 0
            }
            video.onpause = () => {
                autoReplaySequence(video)
            }
            loopToggleBtn.classList.add("loop-active")
        } else {
            video.onpause = undefined
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
    video.onpause = undefined
}
export default { enableLoop, disableLoop }