// issue 01
// - it wont detect the first short video if the short feed page changed from one feed to another.
//   since neither the subdirMutation nor initialUrl has been triggered 
console.log("clear screen script on stand by...")

import { getResourceURL } from "@modules/extension_general_lib.js"
import { applyGetElement } from "@modules/dom_lib.js"
import { shortScrolled, initialShortVideo, addFeatureBtn, removeFeatureBtn } from "@modules/youtools_lib.js"

applyGetElement()



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
// add clearscreen botton
function createClearScreenBtn() {
    let infoToggleBtn = document.createElement("div")
    infoToggleBtn.setAttribute("id", "info-toggle-btn")
    let icon = document.createElement("img")
    icon.src = getResourceURL("assets/features/clear_screen/arrow.png")
    infoToggleBtn.append(icon)
    return infoToggleBtn
}
function addFunctionalityToClearScreenBtn(clearScreenBtn, callback) {
    clearScreenBtn.addEventListener("click", callback)
}
function addClearScreenBtnToActionBar(videoRenderer) {
    let clearScreenBtn = createClearScreenBtn()
    addFunctionalityToClearScreenBtn(clearScreenBtn, () => {
        metapanelToggle(videoRenderer)
    })
    addFeatureBtn(videoRenderer, clearScreenBtn, "clear screen")
}
let eventsDispatchers = undefined;

function enableClearScreen() {
    initialShortVideo((videoRenderer) => {
        addClearScreenBtnToActionBar(videoRenderer)
        hideMetapanel(videoRenderer)

    })
    eventsDispatchers =
        shortScrolled((videoRenderer) => {
            addClearScreenBtnToActionBar(videoRenderer)
            hideMetapanel(videoRenderer)
        })

    console.log("clear screen script activated");
}

function disableClearScreen() {
    if (eventsDispatchers === undefined) {
        console.log("clear screen already deactivated");
        return
    }
    eventsDispatchers.disconnect()
    document.getElement("ytd-reel-video-renderer[is-active]", (videoRenderer) => {
        removeFeatureBtn(videoRenderer, "#info-toggle-btn")
        showMetapanel(videoRenderer)
    })
    console.log("clear screen script deactivated");
}

export default { enableClearScreen, disableClearScreen }