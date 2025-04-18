// get the user config schema
async function getUserConfigSchema() {
    let userConfigSchema = await fetch("../schemas/user_config_schema.json")
    userConfigSchema = await userConfigSchema.json()
    return userConfigSchema
}
async function createUserConfig() {
    let userConfigSchema = await getUserConfigSchema()
    console.log("create user configuration...");
    await chrome.storage.sync.set({ "userConfig": userConfigSchema })
}
getUserConfigSchema()
// check for stored userconfig if not create them
async function userConfigManager() {
    let response = await chrome.storage.sync.get(["userConfig"])
    let userConfig = response.userConfig
    // check for the inexistence of stored userConfig
    if (userConfig === undefined) {
        // create userConfig
        console.log("create user configuration...");
        await createUserConfig()
        userConfig = await getUserConfigSchema()
    }
    // apply the userConfig on popup
    // putting all the features on one level for easier reading
    let featuresOnlyList = { ...userConfig.shorts, ...userConfig.videos }
    for (const key in featuresOnlyList) {
        let appropriateToggle = document.querySelector(`[data-feature-name="${key}"]`)
        appropriateToggle.querySelector("input").checked = featuresOnlyList[key]
    }
    // save user config

    let toggleBtns = document.querySelectorAll(".toggle-btn")
    toggleBtns.forEach(toggleBtn => {
        toggleBtn.querySelector("input").onchange = function () {
            let featureName = this.closest(".toggle-btn").dataset.featureName
            let featureGroup = this.closest("section").dataset.featureGroup
            let featureState = this.checked

            userConfig[featureGroup][featureName] = featureState
            let modifiedUserConfig = userConfig
            chrome.storage.sync.set({ "userConfig": modifiedUserConfig })
        }
    });
}
userConfigManager()