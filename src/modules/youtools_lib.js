// manage features
export const featureManager = {
    registery: {},
    addfeatures: function (featuresFuncs) {
        for (const featureName in featuresFuncs) {
            // add it to the regitery
            this.registery[featureName] = {
                featureState: "disabled",
                funcs: { ...featuresFuncs[featureName] }
            }
        }

    },
    getState: function (featureName) {
        if (!this.registery[featureName]?.featureState) {
            console.log(`feature ${featureName} doesn't exist `);
        }
        return this.registery[featureName]?.featureState
    },
    changeState: function (featureName) {
        function firstLetterUpperCase(string) {
            return string[0].toUpperCase() + string.slice(1)
        }
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
            // verblizing the desired state
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