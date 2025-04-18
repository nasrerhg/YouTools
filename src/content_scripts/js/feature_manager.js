console.debug("scripts manager state : active");

import { featureManager, createShortScrolledEvent, currentHref, firstSubdirExtractor, firstSubDirMutation } from "@modules/youtools_lib"
import { applyGetElement } from "@modules/dom_lib.js"
import { getResourceURL } from "@modules/extension_general_lib";

// ---------------------- importing features -----------------------//
// features modules 
import clearScreen from "@content_scripts/js/clear_screen"
import rotation from "@content_scripts/js/rotation"
import loop from "@content_scripts/js/loop"
import controls from "@content_scripts/js/controls"
// add the imported features functions to feature manager registery
featureManager.addfeatures({ rotation, clearScreen, controls, loop })

async function getUserConfigSchema() {
    let userConfigSchemaExtensionURL = await getResourceURL("schemas/user_config_schema.json")
    let userConfigSchema = await fetch(userConfigSchemaExtensionURL)
    userConfigSchema = await userConfigSchema.json()
    return userConfigSchema
}
async function createUserConfig() {
    let userConfigSchema = await getUserConfigSchema()
    await chrome.storage.sync.set({ "userConfig": userConfigSchema })
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
async function getSyncStorage(namespaces) {
    return await chrome.storage.sync.get(namespaces)
}
// class features into groups depending on their state ( to be enabled or disabled)
async function featureClassification(firstSubdir) {
    // get userConfig
    let response = await getSyncStorage("userConfig")
    let userConfig = response.userConfig
    // check for the inexistence of stored userConfig
    if (userConfig === undefined) {
        console.debug("userConfig is undefined");
        console.debug("create user configuration...");
        await createUserConfig()
        userConfig = await getUserConfigSchema()
    }
    // classify features
    let enableFeatures = getEnabledFeatures(firstSubdir, userConfig)
    let disableFeatures = getDisabledFeatures(enableFeatures, userConfig)

    return {
        enable: enableFeatures,
        disable: disableFeatures
    }
}
async function disableAllfeatures() {
    let response = await getSyncStorage("userConfig")
    let userConfig = response.userConfig
    let featuersOnlyList = { ...userConfig.shorts, ...userConfig.videos }
    let featuresNames = Object.keys(featuersOnlyList)

    featuresNames.forEach((featureName) => {
        featureManager.changeState(featureName).disable()
    })
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
    shortScrolled.end()
    // check if the subdir is compatible with any feature
    if (firstSubdir !== "shorts" && firstSubdir !== "watch") {
        console.debug("[ Post trigger process ]\n current page is not compatible with any features !!!");
        disableAllfeatures()
        return
    }
    console.debug("[ Post trigger process ]\n start postTriggerProcess");
    console.debug("[ Post trigger process ]\n addYouloolsActionBar");
    if (firstSubdir === "shorts") {
        let videoRenderer = await document.getElement("ytd-reel-video-renderer[is-active]")
        addYouloolsActionBar(videoRenderer)
        shortScrolled.start((videoRenderer) => {
            addYouloolsActionBar(videoRenderer)
        })
    }
    let featuresClassification = await featureClassification(firstSubdir)
    console.debug("[ Post trigger process ]\n featureClassification : ", featuresClassification);
    console.debug("[ Post trigger process ]\n implementing the classification");
    implementClassification(featuresClassification)
    console.debug("[ Post trigger process ]\n end postTriggerProcess");
}

async function addYouloolsActionBar(videoRenderer) {
    if (videoRenderer.querySelector("#youtools-action-bar")) {
        console.debug("youTools action bar already created");
        return
    }
    // creating the action bar element
    let youtoolsActionBar = document.createElement("div")
    youtoolsActionBar.setAttribute("id", "youtools-action-bar")

    let playerOverlayRenderer = await videoRenderer.getElement("ytd-reel-player-overlay-renderer")
    playerOverlayRenderer.append(youtoolsActionBar)
}

function changesDetector(postTriggerProcessCB) {
    // detect initial URL
    initialFirstSubdir(async (firstSubdir) => {
        console.debug("[Change detector]\n Initial URL ( first URL right after a full load)");
        postTriggerProcessCB(firstSubdir)
    })
    // detect first subdirectory mutations
    firstSubDirMutation(async (firstSubdir) => {
        console.debug("[Change detector]\n First sub-directory mutation");
        postTriggerProcessCB(firstSubdir)
    })
    // detect user config changes
    userConfigChanges(async () => {
        console.debug("[Change detector]\n User config change");
        let firstSubdir = firstSubdirExtractor(currentHref())
        postTriggerProcessCB(firstSubdir)
    })
}

//------------------------ execution area -----------------------------------------//
applyGetElement()

let shortScrolled = createShortScrolledEvent()
changesDetector(postTriggerProcess)
