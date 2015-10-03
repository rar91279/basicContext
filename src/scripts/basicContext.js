let overflow = null

const ITEM      = 'item',
      SEPARATOR = 'separator'

const dom = function(elem = '') {

	return document.querySelector('.basicContext ' + elem)

}

const valid = function(item = {}) {

	let emptyItem = (Object.keys(item).length===0 ? true : false)

	// Detect type of item
	if (emptyItem===true) item.type = SEPARATOR
	else                  item.type = ITEM

	// Set default values
	if (item.class==null)     item.class   = ''
	if (item.visible!==false) item.visible = true
	if (item.icon==null)      item.icon    = null
	if (item.title==null)     item.title   = 'Undefined'

	// Add disabled class when item disabled
	if (item.disabled!==true) item.disabled = false
	if (item.disabled===true) item.class += ' basicContext__item--disabled'

	// Item requires a function when
	// it's not a separator and not disabled
	if (item.fn==null && item.type!==SEPARATOR && item.disabled===false) {

		console.warn(`Missing fn for item '${ item.title }'`)
		return false

	}

	return true

}

const buildItem = function(item, num) {

	let html = '',
	    span = ''

	// Parse and validate item
	if (valid(item)===false) return ''

	// Skip when invisible
	if (item.visible===false) return ''

	// Give item a unique number
	item.num = num

	// Generate span/icon-element
	if (item.icon!==null) span = `<span class='basicContext__icon ${ item.icon }'></span>`

	// Generate item
	if (item.type===ITEM) {

		html = `
		       <tr class='basicContext__item ${ item.class }'>
		           <td class='basicContext__data' data-num='${ item.num }'>${ span }${ item.title }</td>
		       </tr>
		       `

	} else if (item.type===SEPARATOR) {

		html = `
		       <tr class='basicContext__item basicContext__item--separator'></tr>
		       `

	}

	return html

}

const build = function(items = []) {

	let html = ''

	html += `
	        <div class='basicContextContainer'>
	            <div class='basicContext'>
	                <table>
	                    <tbody>
	        `

	items.forEach((item, i) => html += buildItem(item, i))

	html += `
	                    </tbody>
	                </table>
	            </div>
	        </div>
	        `

	return html

}

const getNormalizedPosition = function(e = {}) {

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

const getPosition = function(normalizedPosition, context) {

	// Set the initial position
	let x = normalizedPosition.x,
	    y = normalizedPosition.y

	// Get size of browser
	let browserSize = {
		width  : window.innerWidth,
		height : window.innerHeight
	}

	// Get size of context
	let contextSize = {
		width  : context.offsetWidth,
		height : context.offsetHeight
	}

	// Fix position based on context and browser size
	if ((x + contextSize.width) > browserSize.width)   x = x - ((x + contextSize.width) - browserSize.width)
	if ((y + contextSize.height) > browserSize.height) y = y - ((y + contextSize.height) - browserSize.height)

	// Make context scrollable and start at the top of the browser
	// when context is higher than the browser
	if (contextSize.height > browserSize.height) {
		y = 0
		context.classList.add('basicContext--scrollable')
	}

	// Calculate the relative position of the mouse to the context
	let rx = normalizedPosition.x - x,
	    ry = normalizedPosition.y - y

	return { x, y, rx, ry }

}

const bind = function(item = {}) {

	if (item.fn==null)        return false
	if (item.visible===false) return false
	if (item.disabled===true) return false

	dom(`td[data-num='${ item.num }']`).onclick       = item.fn
	dom(`td[data-num='${ item.num }']`).oncontextmenu = item.fn

	return true

}

const setStyles = function(position, context) {

	context.style.left            = `${ position.x }px`
	context.style.top             = `${ position.y }px`
	context.style.transformOrigin = `${ position.rx }px ${ position.ry }px`
	context.style.opacity         = 1

}

const show = function(e, items, opts = {}) {

	// Build context
	let html = build(items)

	// Add context to the body
	document.body.insertAdjacentHTML('beforeend', html)

	// Save current overflow and block scrolling of site
	if (overflow==null) {
		overflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
	}

	// Cache the context
	let context = dom()

	// Get the normalized click position
	let normalizedPosition = getNormalizedPosition(e)

	// Calculate position
	let position = getPosition(normalizedPosition, context)

	// Set styles and position
	if (typeof opts.show === 'function') opts.show(position, context)
	else                                 setStyles(position, context)

	// Bind click on background
	context.parentElement.onclick       = (typeof opts.close === 'function' ? opts.close : close)
	context.parentElement.oncontextmenu = (typeof opts.close === 'function' ? opts.close : close)

	// Bind click on items
	items.forEach(bind)

	// Do not trigger default event or further propagation
	if (typeof e.preventDefault === 'function')  e.preventDefault()
	if (typeof e.stopPropagation === 'function') e.stopPropagation()

	// Call callback when a function
	if (typeof opts.callback === 'function') opts.callback()

	return true

}

const visible = function() {

	let elem = dom()

	if (elem==null || elem.length===0) return false
	else                               return true

}

const close = function() {

	if (visible()===false) return false

	let container = dom().parentElement

	container.parentElement.removeChild(container)

	// Reset overflow to its original value
	if (overflow!=null) {
		document.body.style.overflow = overflow
		overflow = null
	}

	return true

}

return {
	ITEM,
	SEPARATOR,
	show,
	visible,
	close
}