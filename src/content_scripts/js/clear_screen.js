// issue 01
// - it wont detect the first short video if the short feed page changed from one feed to another.
//   since neither the subdirMutation nor initialUrl has been triggered 
console.log("clear screen script on stand by...")

import { applyGetElement } from "@modules/dom_lib.js"

applyGetElement()





export function featureStateHandler(featureName, callbacks) {
    window.addEventListener("message", (event) => {
        let request = event.data
        // check extension id
        if (request.extensionId !== chrome.runtime.id) {
            return
        }
        // check feature name
        if (request.featureName !== featureName) {
            return
        }

        // invoke the appropriate function
        if (request.requestedState) {
            callbacks.onActivate(request)
        }
        if (!request.requestedState) {
            callbacks.onDeactivate(request)
        }
    })
}

function isHTMLElement(element) {
    return element && element.nodeType === 1 && typeof element.tagName === "string" && typeof element === 'object'
}

function getResourceURL(path) {
    return chrome.runtime.getURL(path)
}

function shortScrolled(callback) {
    let mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.target.nodeName === "YTD-REEL-VIDEO-RENDERER" && mutation.target.getAttribute("is-active") !== null) {

                callback(mutation.target)
            }
        });
    })
    mutationObserver.observe(document, { subtree: true, attributes: true, attributeFilter: ["is-active"] })
    return mutationObserver
}
// hides or show the short playback metapanel
function metapanelToggle(videoRenderer) {
    videoRenderer.querySelector("#info-toggle-btn").querySelector("img").classList.toggle("info-toggle-btn-show")
    videoRenderer.getElement("#metapanel", (metapanel) => {
        metapanel.classList.toggle("fade-aside")
        // rectification in case of tangling of the toggle btn and metapanel appearence state
        if (
            (metapanel.classList.contains("fade-aside") && !videoRenderer.querySelector("#info-toggle-btn").querySelector("img").classList.contains("info-toggle-btn-show"))
            ||
            (!metapanel.classList.contains("fade-aside") && videoRenderer.querySelector("#info-toggle-btn").querySelector("img").classList.contains("info-toggle-btn-show"))
        ) {
            console.log("untangled");

            metapanel.classList.toggle("fade-aside")
        }
    })
}
// add clearscreen botton
function addClearScreenBtn(videoRenderer) {
    let infoToggleBtn = document.createElement("div")
    infoToggleBtn.setAttribute("id", "info-toggle-btn")
    let icon = document.createElement("img")
    icon.src = getResourceURL("assets/features/clear_screen/arrow.png")
    infoToggleBtn.append(icon)
    videoRenderer.querySelector(".short-video-container").append(infoToggleBtn)
}
// hide metapanel
function hideMetapanel(videoRenderer) {
    videoRenderer.getElement("#info-toggle-btn", (toggleBtn) => {
        toggleBtn.querySelector("img").classList.add("info-toggle-btn-show")
    })
    videoRenderer.getElement("#metapanel", (metapanel) => {
        metapanel.classList.add("fade-aside")
    })
}
// adding all the screen clear components to video renderer
function addClearScreenToContainer(container) {
    // if it is already added stop
    if (container.querySelector("#info-toggle-btn")) {
        return
    }
    // create the metapanel appearence toggle botton
    addClearScreenBtn(container)
    // adding functionality to the btn
    container.querySelector("#info-toggle-btn").addEventListener("click", () => {
        metapanelToggle(container)
    })
}

/*
export function runClearscreen() {
    let eventsDispatchers = undefined;
    featureStateHandler("clearScreen", {
        onActivate: () => {
            // initial short video
            document.getElement("ytd-reel-video-renderer[is-active]", (videoRenderer) => {
                addClearScreenToContainer(videoRenderer)
                hideMetapanel(videoRenderer)
            })

            eventsDispatchers =
                shortScrolled((videoRenderer) => {
                    addClearScreenToContainer(videoRenderer)
                    hideMetapanel(videoRenderer)
                })

            console.log("clear screen script activated");      
        },
        onDeactivate: () => {
            if (eventsDispatchers === undefined) {
                console.log("clear screen already deactivated");
                return
            }
            eventsDispatchers.disconnect()
            document.getElement("ytd-reel-video-renderer[is-active]", (videoRenderer) => {

                videoRenderer.querySelector("#info-toggle-btn")?.remove()

                videoRenderer.getElement("#metapanel", (metapanel) => {
                    metapanel.classList.remove("fade-aside")
                    console.log("metapanel shown");
                })
            })
            console.log("clear screen script deactivated");
        }
    })
}
*/
let eventsDispatchers = undefined;
function enableClearScreen() {
    // initial short video
    document.getElement("ytd-reel-video-renderer[is-active]", (videoRenderer) => {
        addClearScreenToContainer(videoRenderer)
        hideMetapanel(videoRenderer)
    })

    eventsDispatchers =
        shortScrolled((videoRenderer) => {
            addClearScreenToContainer(videoRenderer)
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

        videoRenderer.querySelector("#info-toggle-btn")?.remove()

        videoRenderer.getElement("#metapanel", (metapanel) => {
            metapanel.classList.remove("fade-aside")
            console.log("metapanel shown");
        })
    })
    console.log("clear screen script deactivated");
}

export default { enableClearScreen, disableClearScreen }