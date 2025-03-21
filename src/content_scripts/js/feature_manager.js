console.log("scripts manager state : active");

import { featureManager, shortScrolled, currentHref, firstSubdirExtractor, firstSubDirMutation } from "@modules/youtools_lib"
import { applyGetElement } from "@modules/dom_lib.js"

// ---------------------- importing features -----------------------//
// features modules 
import clearScreen from "@content_scripts/js/clear_screen"
import rotation from "@content_scripts/js/rotation"
import loop from "@content_scripts/js/loop"
import controls from "@content_scripts/js/controls"
// add the imported features functions to feature manager registery
console.log("[ feature manager module ] => adding features functions to the registery...");
featureManager.addfeatures({ rotation, clearScreen, controls, loop })

// implement the classification (userConfig)
function implementClassification(featuresClassification) {
    for (const featureName of featuresClassification.disable) {
        featureManager.changeState(featureName).disable()
    }
    for (const featureName of featuresClassification.enable) {
        featureManager.changeState(featureName).enable()
    }
}
// identifying the feature group name from the URL subdir
function featureGroupNameIdentifier(firstSubdir) {
    if (firstSubdir === "watch") {
        return "videos"
    } else {
        return firstSubdir
    }
}
// get group features states
function getCompatibleFeatureGroup(groupName, userConfig) {
    // select the group
    let CompatibleFeatureGroup = userConfig[groupName]
    // return the group config list of its features
    return CompatibleFeatureGroup
}
// get all the features set to enable in the user configuration
function getEnabledFeatures(firstSubdir, userConfig) {
    // compatible feature groups identification
    // get feature group name
    let groupName = featureGroupNameIdentifier(firstSubdir)
    // get the features group from userConfig 
    let featuresGroup = getCompatibleFeatureGroup(groupName, userConfig)
    // filter the features set to enabled ( true )
    let enabledFeatures = []
    for (const featureName in featuresGroup) {
        if (featuresGroup[featureName] === true) {
            enabledFeatures.push(featureName)
        }
    }
    return enabledFeatures
}
// invert of the selected features by getEnabledFeatures()
function getDisabledFeatures(enabledFeatures, userConfig) {
    let allFeaturesNames = { ...userConfig["shorts"], ...userConfig["videos"] }

    for (const enabledFeatureName of enabledFeatures) {
        delete allFeaturesNames[enabledFeatureName]
    }

    return Object.keys(allFeaturesNames)
}
async function getLocalStorage(namespaces) {
    return await chrome.storage.local.get(namespaces)
}
// class features into groups depending on their state ( to be enabled or disabled)
async function featureClassification(firstSubdir) {
    // get userConfig
    let response = await getLocalStorage("userConfig")
    let userConfig = response.userConfig
    // classify features
    let enableFeatures = getEnabledFeatures(firstSubdir, userConfig)
    let disableFeatures = getDisabledFeatures(enableFeatures, userConfig)

    return {
        enable: enableFeatures,
        disable: disableFeatures
    }
}


// initial page loading
function initialFirstSubdir(postTriggerProcessCB) {
    let firstSubdir = firstSubdirExtractor(currentHref())
    postTriggerProcessCB(firstSubdir)
}
// triggers on local storage changes
function userConfigChanges(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        callback()
    })
}

async function postTriggerProcess(firstSubdir) {
    // check if the subdir is compatible with any feature
    if (firstSubdir !== "shorts" && firstSubdir !== "watch") {
        console.log("current page is not compatible with any features");
        return
    }
    console.log(">>> start postTriggerProcess");
    console.log(">>> addYouloolsActionBar");

    let videoRenderer = await document.getElement("ytd-reel-video-renderer[is-active]")
    addYouloolsActionBar(videoRenderer)
    shortScrolled((videoRenderer) => {
        addYouloolsActionBar(videoRenderer)
    })
    let featuresClassification = await featureClassification(firstSubdir)
    console.log("[ feature manager module ] => implementing the classification");
    console.log("featureClassification : ", featuresClassification);

    implementClassification(featuresClassification)
    console.log(">>> end postTriggerProcess");
}



//------------------------ execution area -----------------------------------------//
applyGetElement()

//------------------------ creating Youtools features action bar ----------------------//
async function addYouloolsActionBar(videoRenderer) {
    if (videoRenderer.querySelector("#youtools-action-bar")) {
        console.log("youTools action bar already created");
        return
    }
    // creating the action bar element
    let youtoolsActionBar = document.createElement("div")
    youtoolsActionBar.setAttribute("id", "youtools-action-bar")

    let playerOverlayRenderer = await videoRenderer.getElement("ytd-reel-player-overlay-renderer")
    playerOverlayRenderer.append(youtoolsActionBar)
}


//------------------------ applying the appropriate features ----------------------//

function changesDetector(postTriggerProcessCB) {
    // detect initial URL
    initialFirstSubdir(async (firstSubdir) => {
        console.log(">>> initialFirstSubdir");
        postTriggerProcessCB(firstSubdir)
    })
    // detect first subdirectory mutations
    firstSubDirMutation(async (firstSubdir) => {
        console.log(">>> firstSubDirMutation");
        postTriggerProcessCB(firstSubdir)
    })
    // detect user config changes
    userConfigChanges(async () => {
        console.log(">>> userConfig change");
        let firstSubdir = firstSubdirExtractor(currentHref())
        postTriggerProcessCB(firstSubdir)
    })
}

changesDetector(postTriggerProcess)
