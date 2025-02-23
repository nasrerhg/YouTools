export function isHTMLElement(element) {
    return element && element.nodeType === 1 && typeof element.tagName === "string" && typeof element === 'object'
}
export function applyGetElement() {
    Node.prototype.getElement =
        function (elementIdentification, callback) {
            let previousElement = this;
            if (isHTMLElement(this.previousElement)) {
                previousElement = this.previousElement
            }
            //  check if exists
            if (previousElement.querySelector(elementIdentification)) {
                callback?.(previousElement.querySelector(elementIdentification))
                return previousElement.querySelector(elementIdentification)
            }
            // check for the element after each mutation in the document
            let mutationObserver = new MutationObserver((mutations) => {
                if (previousElement.querySelector(elementIdentification)) {
                    callback?.(previousElement.querySelector(elementIdentification))
                    mutationObserver.disconnect()
                    return previousElement.querySelector(elementIdentification)
                }
            })
            mutationObserver.observe(document, { subtree: true, childList: true, attributes: true })
        }
}

