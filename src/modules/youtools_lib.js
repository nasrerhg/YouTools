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
                console.log(`${featureName}'s enable function is not available the functions object from the module !`);
                continue
            }
            if (!featuresFuncs[featureName][`disable${firstLetterUpperCase(featureName)}`]) {
                console.log(`${featureName}'s disable function is not available the functions object from the module !`);
                continue
            }
            // add it to the regitery
            this.registery[featureName] = {
                featureState: "disabled",
                funcs: { ...featuresFuncs[featureName] }
            }
        }
        console.log("registery : ", this.registery)
    },
    getState: function (featureName) {
        if (!this.registery[featureName]?.featureState) {
            console.log(`feature ${featureName} doesn't exist `);
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
                console.log(`feature ${featureName} state is already ${desiredState}`)
                return
            }
            // verblizing the desired state ( remove the simple past "d" )
            let verblizedDesiredState = desiredState.slice(0, desiredState.length - 1)

            this.registery[featureName].funcs[`${verblizedDesiredState}${firstLetterUpperCase(featureName)}`]()
            this.registery[featureName].featureState = desiredState
            console.log(`feature ${featureName} state is ${desiredState}`)
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
export function shortScrolled(callback) {
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
// adds features buttons to the youtools action bar
export async function addFeatureBtn(videoRenderer, btnElement, featureTitle) {
    console.log("btn Element : ", btnElement);
    let youtoolsActionBar = await videoRenderer.getElement("#youtools-action-bar")
    if (youtoolsActionBar.querySelector(`#${btnElement.id}`)) {
        console.log("btn already added");
        return
    }
    let btnWrapper = document.createElement("div")
    btnWrapper.classList.add("btn-wrapper")
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
export function removeFeatureBtn(videoRenderer, btnElementIdentifier) {
    console.log("removeFeatureBtn-------");
    console.log("the btn : ", videoRenderer.querySelector(btnElementIdentifier));
    console.log("the parent : ", videoRenderer.querySelector(btnElementIdentifier).parentElement);
    videoRenderer.querySelector(btnElementIdentifier).closest(".btn-wrapper").remove()
}

// --------------------------------------------
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
    console.log("new short video page detected (full load)");
    callback(videoRenderer)
    // detects any short videos after a short videos page mutation
    firstSubDirMutation(async (firstSubdir) => {
        if (firstSubdir !== "shorts") {
            return
        }
        let videoRenderer = await document.getElement("ytd-reel-video-renderer[is-active]")
        console.log("new short video page detected (mutation)");
        callback(videoRenderer)
    })
}