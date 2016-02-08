const getNormalizeEvent = function(e) {

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

const getBrowserSize = function() {

	return {
		width  : window.innerWidth,
		height : window.innerHeight
	}

}

const getElemSize = function(elem) {

	let size = elem.getBoundingClientRect()

	return {
		width  : size.width,
		height : size.height
	}

}

export default function(e = {}, elem) {

	let normalizedPosition = getNormalizeEvent(e)

	// Set the initial position
	let x = normalizedPosition.x
	let y = normalizedPosition.y

	// Get size of browser
	let browserSize = getBrowserSize()

	// Get size of elem
	let elemSize = getElemSize(elem)

	// Fix position based on elem and browser size
	// The context should never leave the screen
	if ((x + elemSize.width) > browserSize.width)   x = x - ((x + elemSize.width) - browserSize.width)
	if ((y + elemSize.height) > browserSize.height) y = y - ((y + elemSize.height) - browserSize.height)

	// Make elem scrollable and start at the top of the browser
	// when elem is higher than the browser
	if (elemSize.height > browserSize.height) {
		y = 0
		elem.classList.add('basicContext--scrollable')
	}

	// Calculate the relative position of the mouse to the elem
	let rx = normalizedPosition.x - x
	let ry = normalizedPosition.y - y

	return { x, y, rx, ry }

}