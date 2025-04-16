import { getResourceURL } from "@modules/extension_general_lib.js"
import { createShortScrolledEvent, initialShortVideo, addFeatureBtnToActionBar, removeFeatureBtnFromActionBar } from "@modules/youtools_lib.js"

// >>>>>>>
// ---- creating elements
// <<<<<<<

function createClearScreenBtn() {
    let infoToggleBtn = document.createElement("div")
    infoToggleBtn.setAttribute("id", "info-toggle-btn")
    let icon = document.createElement("img")
    icon.src = getResourceURL("assets/features/clear_screen/arrow.png")
    infoToggleBtn.append(icon)
    return infoToggleBtn
}

// >>>>>>>
// ---- Adding functionality
// <<<<<<<

// hides or show the short playback metapanel
function metapanelToggle(videoRenderer) {
    videoRenderer.classList.toggle("clear-screen")
}
// hide metapanel
function hideMetapanel(videoRenderer) {
    videoRenderer.classList.add("clear-screen")
}
// show metapanel
function showMetapanel(videoRenderer) {
    videoRenderer.classList.remove("clear-screen")
}

function addFunctionalityToClearScreenBtn(clearScreenBtn, callback) {
    clearScreenBtn.addEventListener("click", callback)
}
// >>>>>>>
// ---- Implementing feature
// <<<<<<<

function implementClearScreenOnVideoRenderer(videoRenderer) {
    let clearScreenBtn = createClearScreenBtn()
    addFunctionalityToClearScreenBtn(clearScreenBtn, () => {
        metapanelToggle(videoRenderer)
    })
    addFeatureBtnToActionBar(videoRenderer, clearScreenBtn, "clear screen")
    hideMetapanel(videoRenderer)
}

let shortScrolled = createShortScrolledEvent();

function enableClearScreen() {
    initialShortVideo((videoRenderer) => {
        implementClearScreenOnVideoRenderer(videoRenderer)
    })
    shortScrolled.start((videoRenderer) => {
        implementClearScreenOnVideoRenderer(videoRenderer)
    })
}

function disableClearScreen() {
    shortScrolled.end()
    document.getElement("ytd-reel-video-renderer[is-active]", (videoRenderer) => {
        removeFeatureBtnFromActionBar(videoRenderer, "#info-toggle-btn")
        showMetapanel(videoRenderer)
    })
}

export default { enableClearScreen, disableClearScreen }