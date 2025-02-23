console.log("scripts manager state : active");

import { featureManager } from "@modules/youtools_lib"

// ---------------------- importing features -----------------------//
// clearscreen 
import clearScreen from "@content_scripts/js/clear_screen"
// add the imported features to feature manager
featureManager.addfeatures({ clearScreen })


function currentHref() {
    return window.location.href
}
function firstSubdirExtractor(url) {
    return new URL(url).pathname.slice("1").split("/")[0]
}
// implement the classification (userConfig)
function implementClassification(featuresClassification) {
    for (const featureName of featuresClassification.disable) {
        featureManager.changeState(featureName).disable()
    }
    for (const featureName of featuresClassification.enable) {
        featureManager.changeState(featureName).enable()
    }
}
// URL mutations (not page full reloads)
function URLMutaion(callback) {
    let previousUrl = currentHref();
    let mutationObserver = new MutationObserver((mutations) => {
        if (previousUrl !== currentHref()) {
            callback(currentHref())
            previousUrl = currentHref()
        }
    })
    mutationObserver.observe(document, { childList: true, subtree: true })
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
// triggers when there is mutation in the first sub-directory
function firstSubDirMutation(callback) {
    let previousFirstSubDir = firstSubdirExtractor(currentHref())
    URLMutaion((newURL) => {
        if (firstSubdirExtractor(currentHref()) !== previousFirstSubDir) {
            callback(firstSubdirExtractor(currentHref()))
            previousFirstSubDir = firstSubdirExtractor(currentHref())
        }
    })
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

    let featuresClassification = await featureClassification(firstSubdir)

    implementClassification(featuresClassification)
}



//------------------------ execution area -----------------------------------------//
function changesDetector(postTriggerProcessCB) {
    // detect initial URL
    initialFirstSubdir(async (firstSubdir) => {
        postTriggerProcessCB(firstSubdir)
    })
    // detect first subdirectory mutations
    firstSubDirMutation(async (firstSubdir) => {
        postTriggerProcessCB(firstSubdir)
    })
    // detect user config changes
    userConfigChanges(async () => {
        let firstSubdir = firstSubdirExtractor(currentHref())
        postTriggerProcessCB(firstSubdir)
    })
}

changesDetector(postTriggerProcess)
