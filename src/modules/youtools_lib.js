function firstLetterUpperCase(string) {
    return string[0].toUpperCase() + string.slice(1)
}
// manage features
export const featureManager = {
    registery: {},
    addfeatures: function (featuresFuncs) {
        for (const featureName in featuresFuncs) {
            // check existence of the funcs
            if (!featuresFuncs[featureName][`enable${firstLetterUpperCase(featureName)}`]) {
                console.debug(`[Registery]\n ${featureName}'s enable function is not available the functions object from the module !`);
                continue
            }
            if (!featuresFuncs[featureName][`disable${firstLetterUpperCase(featureName)}`]) {
                console.debug(`[Registery]\n ${featureName}'s disable function is not available the functions object from the module !`);
                continue
            }
            // add it to the regitery
            this.registery[featureName] = {
                featureState: "disabled",
                funcs: { ...featuresFuncs[featureName] }
            }
        }
        console.debug("[Registery]\n features had been added : \n", this.registery)
    },
    getState: function (featureName) {
        if (!this.registery[featureName]?.featureState) {
            console.debug(`[Registery]\n feature ${featureName} doesn't exist `);
        }
        return this.registery[featureName]?.featureState
    },
    changeState: function (featureName) {
        // if the feature name doesn't exist
        if (!this.getState(featureName)) {
            return {
                enable: () => { },
                disable: () => { }
            }
        }
        const changeRegisteryStateAndExecute = (desiredState) => {
            if (this.registery[featureName].featureState === desiredState) {
                console.debug(`[Registery]\n feature ${featureName} state is already ${desiredState}`)
                return
            }
            // verblizing the desired state ( remove the simple past "d" )
            let verblizedDesiredState = desiredState.slice(0, desiredState.length - 1)

            this.registery[featureName].funcs[`${verblizedDesiredState}${firstLetterUpperCase(featureName)}`]()
            this.registery[featureName].featureState = desiredState
            console.debug(`[Registery]\n feature ${featureName} state is ${desiredState}`)
        }
        return {
            enable: () => {
                changeRegisteryStateAndExecute("enabled")
            },
            disable: () => {
                changeRegisteryStateAndExecute("disabled")
            }
        }
    }
}
// detects when a short feed was scrolled 
export function createShortScrolledEvent() {
    let mutationObserver
    return {
        start: (callback) => {
            mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === "attributes") {
                        console.log("mutation", mutation);
                    }
                    if (mutation.type === "attributes" && mutation.target.nodeName === "YTD-REEL-VIDEO-RENDERER" && mutation.attributeName === "is-active") {
                        callback(mutation.target)
                        console.debug("[Short Scrolled Detector ] \n attribute");
                        return
                    }
                    if (mutation.type === "childList" && Array.from(mutation.addedNodes).includes(document.querySelector("ytd-reel-video-renderer[is-active]"))) {
                        callback(document.querySelector("ytd-reel-video-renderer[is-active]"))
                        console.debug("[Short Scrolled Detector ] \n childList");
                        return
                    }
                });
            })
            mutationObserver.observe(document, { subtree: true, attributes: true, attributeFilter: ["is-active"], childList: true })
        },
        end: () => {
            mutationObserver?.disconnect()
        }
    }
}
// adds features buttons to the youtools action bar
export async function addFeatureBtnToActionBar(videoRenderer, btnElement, featureTitle) {
    let youtoolsActionBar = await videoRenderer.getElement("#youtools-action-bar")
    if (youtoolsActionBar.querySelector(`#${btnElement.id}`)) {
        console.debug("btn already added");
        return
    }
    let btnWrapper = document.createElement("div")
    btnWrapper.classList.add("btn-wrapper")
    btnWrapper.id = `bw-${btnElement.id}`
    let btnContainer = document.createElement("div")
    btnContainer.classList.add("btn-container")
    let title = document.createElement("div")
    title.classList.add("btn-title")
    title.textContent = featureTitle
    btnContainer.append(btnElement)
    btnWrapper.append(btnContainer)
    btnWrapper.append(title)

    youtoolsActionBar.append(btnWrapper)
}
export function removeFeatureBtnFromActionBar(videoRenderer, btnElementIdentifier) {
    videoRenderer.querySelector(btnElementIdentifier)?.closest(".btn-wrapper").remove()
}
// 
export function currentHref() {
    return window.location.href
}
export function URLMutaion(callback) {
    let previousUrl = currentHref();
    let mutationObserver = new MutationObserver((mutations) => {
        if (previousUrl !== currentHref()) {
            callback(currentHref())
            previousUrl = currentHref()
        }
    })
    mutationObserver.observe(document, { childList: true, subtree: true })
}
export function firstSubdirExtractor(url) {
    return new URL(url).pathname.slice("1").split("/")[0]
}
export function firstSubDirMutation(callback) {
    let previousFirstSubDir = firstSubdirExtractor(currentHref())
    URLMutaion((newURL) => {
        if (firstSubdirExtractor(currentHref()) !== previousFirstSubDir) {
            callback(firstSubdirExtractor(currentHref()))
            previousFirstSubDir = firstSubdirExtractor(currentHref())
        }
    })
}
// initial short video
export async function initialShortVideo(callback) {
    // detects any short videos right after the full load of the page
    let videoRenderer = await document.getElement("ytd-reel-video-renderer[is-active]")
    console.debug("[initial short Video Detector ] \n new short video page detected (full load)");
    callback(videoRenderer)
    // detects any short videos after a short videos page mutation
    firstSubDirMutation(async (firstSubdir) => {
        if (firstSubdir !== "shorts") {
            return
        }
        let videoRenderer = await document.getElement("ytd-reel-video-renderer[is-active]")
        console.debug("[initial short Video Detector ] \n new short video page detected (mutation)");
        callback(videoRenderer)
    })
}