// user config blueprint
let userConfigSchema = {
    shorts:{
        clearScreen: false,
        rotation: false,
        controls: false
    },
    videos:{
        loop:false
    }
}
// check for stored userconfig if not create them
chrome.storage.local.get("userConfig",(response)=>{
    let userConfig = response.userConfig
    console.log("response : ", userConfig)
    // check for the inexistence of stored userConfig
    if (userConfig === undefined) {
        // create userConfig
        console.log("create user configuration...");
        chrome.storage.local.set({"userConfig":userConfigSchema}) 
    }
    // apply the userConfig on popup
    console.log("apply");
    
    let featuresOnlyList = {...userConfig.shorts,...userConfig.videos}
    for (const key in featuresOnlyList) {
        let appropriateToggle = document.querySelector(`[data-feature-name="${key}"]`)
        appropriateToggle.querySelector("input").checked = featuresOnlyList[key]
        // console.log(appropriateToggle);
    }
    // save user config
    let toggleBtns = document.querySelectorAll(".toggle-btn")
    toggleBtns.forEach(toggleBtn => {
        toggleBtn.querySelector("input").onchange = function(){
            let featureName = this.closest(".toggle-btn").dataset.featureName
            let featureGroup = this.closest("section").dataset.featureGroup
            let featureState = this.checked
            console.log(userConfig);
            console.log("--------------");
            console.log("featureName : ",featureName)
            console.log("featureGroup :",featureGroup,userConfig[featureGroup])
            console.log("featureState :",featureState)
            console.log("--------------");
            
            userConfig[featureGroup][featureName]=featureState
            let modifiedUserConfig = userConfig
            chrome.storage.local.set({"userConfig":modifiedUserConfig})
        }
    });

})