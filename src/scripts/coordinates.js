const normalize = function(e = {}) {

	let pos = {
		x : e.clientX,
		y : e.clientY
	}

	if (e.type==='touchend' && (pos.x==null || pos.y==null)) {

		// We need to capture clientX and clientY from original event
		// when the event 'touchend' does not return the touch position

		let touches = e.changedTouches

		if (touches!=null && touches.length>0) {
			pos.x = touches[0].clientX
			pos.y = touches[0].clientY
		}

	}

	// Position unknown
	if (pos.x==null || pos.x < 0) pos.x = 0
	if (pos.y==null || pos.y < 0) pos.y = 0

	return pos

}

export const get = function(e, elem) {

	let normalizedPosition = normalize(e)

	// Set the initial position
	let x = normalizedPosition.x,
	    y = normalizedPosition.y

	// Get size of browser
	let browserSize = {
		width  : window.innerWidth,
		height : window.innerHeight
	}

	// Get size of elem
	let elemSize = {
		width  : elem.offsetWidth,
		height : elem.offsetHeight
	}

	// Fix position based on elem and browser size
	if ((x + elemSize.width) > browserSize.width)   x = x - ((x + elemSize.width) - browserSize.width)
	if ((y + elemSize.height) > browserSize.height) y = y - ((y + elemSize.height) - browserSize.height)

	// Make elem scrollable and start at the top of the browser
	// when elem is higher than the browser
	if (elemSize.height > browserSize.height) {
		y = 0
		elem.classList.add('basicContext--scrollable')
	}

	// Calculate the relative position of the mouse to the elem
	let rx = normalizedPosition.x - x,
	    ry = normalizedPosition.y - y

	return { x, y, rx, ry }

}