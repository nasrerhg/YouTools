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
