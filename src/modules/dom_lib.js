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
                    // console.log("looking for " + elementIdentification);

                    if (previousElement.querySelector(elementIdentification)) {
                        callback?.(previousElement.querySelector(elementIdentification))
                        resolve(previousElement.querySelector(elementIdentification))
                        mutationObserver.disconnect()
                        // console.log("found " + elementIdentification);

                    }
                })
                mutationObserver.observe(document, { subtree: true, childList: true, attributes: true })
            })

        }
}