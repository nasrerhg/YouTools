export function isHTMLElement(element) {
    return element && element.nodeType === 1 && typeof element.tagName === "string" && typeof element === 'object'
}
export function applyGetElement() {
    Node.prototype.getElement =
        function (elementIdentification, callback) {
            return new Promise((resolve, reject) => {
                let previousElement = this;
                if (isHTMLElement(this.previousElement)) {
                    previousElement = this.previousElement
                }
                //  check if exists
                if (previousElement.querySelector(elementIdentification)) {
                    callback?.(previousElement.querySelector(elementIdentification))
                    resolve(previousElement.querySelector(elementIdentification))
                    return
                }
                // check for the element after each mutation in the document
                let mutationObserver = new MutationObserver((mutations) => {
                    if (previousElement.querySelector(elementIdentification)) {
                        callback?.(previousElement.querySelector(elementIdentification))
                        resolve(previousElement.querySelector(elementIdentification))
                        mutationObserver.disconnect()

                    }
                })
                mutationObserver.observe(document, { subtree: true, childList: true, attributes: true })
            })

        }
    console.log("getElement Method is applied to the Node object prototype \n  exaclty like querySelector but with it keeps looking until it finds the element")
}
export function clicksManager(element) {
    let waitingForConsecutiveClick = false
    let justDoubleClicked = false
    let longMouseDownStarted = false
    let justLongClicked = false

    let singleClickTimeout
    let longMouseDownTimeout

    let singleClickCallback
    let doubleClickCallback
    let longMouseDownStartCallback
    let longMouseDownEndCallback

    function doubleClick(callback, event) {
        if (waitingForConsecutiveClick) {
            clearTimeout(singleClickTimeout)
            waitingForConsecutiveClick = false
            justDoubleClicked = true
            callback?.(event)
        }
    }

    function singleClick(callback, event) {
        if (justDoubleClicked) {
            justDoubleClicked = false
            return
        }
        if (justLongClicked) {
            justLongClicked = false
            return
        }
        waitingForConsecutiveClick = true
        singleClickTimeout = setTimeout(() => {
            // console.log("click !");
            waitingForConsecutiveClick = false
            callback?.(event)
        }, 400);
    }

    function longMouseDownStart(callback, event) {
        longMouseDownTimeout =
            setTimeout(() => {
                longMouseDownStarted = true
                justLongClicked = true
                callback?.(event)
            }, 500);
    }
    function longMouseDownEnd(callback, event) {
        clearTimeout(longMouseDownTimeout)
        if (longMouseDownStarted) {
            longMouseDownStarted = false
            callback?.(event)
        }
    }

    element.addEventListener("mousedown", (event) => {
        longMouseDownStart(longMouseDownStartCallback, event)
    })
    element.addEventListener("mouseup", (event) => {
        longMouseDownEnd(longMouseDownEndCallback, event)
    })
    element.addEventListener("mouseleave", (event) => {
        longMouseDownEnd(longMouseDownEndCallback, event)
    })
    element.addEventListener("click", (event) => {
        doubleClick(doubleClickCallback, event)
        singleClick(singleClickCallback, event)
    })

    return {
        onSingleClick: (callback) => {
            singleClickCallback = callback
        },
        onDoubleClick: (callback) => {
            doubleClickCallback = callback
        },
        onLongMouseDownStart: (callback) => {
            longMouseDownStartCallback = callback
        },
        onLongMouseDownEnd: (callback) => {
            longMouseDownEndCallback = callback
        }
    }

}