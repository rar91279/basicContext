let overflow = null

const ITEM      = 'ITEM',
      SEPARATOR = 'SEPARATOR'

const getParsedItem = function(item = {}) {

	// Detect type of item
	item.type = (Object.keys(item).length===0 ? SEPARATOR : ITEM)

	// Set default values
	if (item.class==null)     item.class   = ''
	if (item.visible!==false) item.visible = true
	if (item.content==null)   item.content = 'Undefined'

	// Add disabled class when item disabled
	if (item.disabled!==true) item.disabled = false
	if (item.disabled===true) item.class += ' basicContext__item--disabled'

	// Item requires a function when
	// it's not a separator and not disabled
	if (typeof item.fn !== 'function' && item.type!==SEPARATOR && item.disabled===false) {

		console.warn(`Missing fn for item '${ item.content }'`)
		item = null

	}

	return item

}

const setContextEvents = function(close, context) {

	context.parentElement.onclick       = close
	context.parentElement.oncontextmenu = close

	return true

}

const setItemEvents = function(item, elem) {

	if (elem==null)           return false
	if (item.visible===false) return false
	if (item.disabled===true) return false

	elem.onclick       = item.fn
	elem.oncontextmenu = item.fn

	if (item.items!=null) {

		let timeout = null

		elem.onmouseenter = () => {
			clearTimeout(timeout)
			timeout = setTimeout(() => showSubContext(item.items, elem), 150)
		}

		elem.onmouseleave = () => {
			clearTimeout(timeout)
		}

	}

	return true

}

const setPlaceholderEvents = function(close, placeholder, bC) {

	placeholder.onmouseleave = () => {

		if (bC.active()===true) return false

		// Close context
		close()

	}

	return true

}

const setOverflow = function() {

	if (overflow!=null) return false

	overflow = document.body.style.overflow
	document.body.style.overflow = 'hidden'

	return true

}

const resetOverflow = function() {

	if (overflow==null) return false

	document.body.style.overflow = overflow
	overflow = null

	return true

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

const showContext = function(position, context) {

	context.style.top             = `${ position.y }px`
	context.style.left            = `${ position.x }px`
	context.style.transformOrigin = `${ position.rx }px ${ position.ry }px`
	context.style.opacity         = 1

	return true

}

const showPlaceholder = function(boundingClientRect, placeholder) {

	placeholder.style.top     = `${ boundingClientRect.top }px`
	placeholder.style.left    = `${ boundingClientRect.left }px`
	placeholder.style.width   = `${ boundingClientRect.width }px`
	placeholder.style.height  = `${ boundingClientRect.height }px`

	return true

}

const showSubContext = function(items, elem) {

	let boundingClientRect = elem.getBoundingClientRect()

	let close = (bC) => {

		// Remove highlight from element
		elem.classList.remove('basicContext__item--hover')

		// Close context
		bC.close()

	}

	let e = {
		clientX : boundingClientRect.left + boundingClientRect.width,
		clientY : boundingClientRect.top
	}

	let opts = {
		source : boundingClientRect,
		close  : close
	}

	// Show the sub-context
	new basicContext(e, items, opts)

	// Highlight current element
	elem.classList.add('basicContext__item--hover')

}

const renderContext = function(id, items = '') {

	return `
	       <div class="basicContextContainer">
	           <div class="basicContext" data-id="${ id }"">
	               <table>
	                   <tbody>
	                   		${ items }
	                   </tbody>
	               </table>
	           </div>
	       </div>
	       `

}

const renderItem = function(item, num) {

	let html = ''

	// Skip when invalid
	if (item===null) return ''

	// Skip when invisible
	if (item.visible===false) return ''

	// Give item a unique number
	item.num = num

	// Generate item
	if (item.type===ITEM) {

		html = `
		       <tr class="basicContext__item ${ item.class }" data-num="${ item.num }">
		           <td class='basicContext__data'>${ item.content }</td>
		       </tr>
		       `

	} else if (item.type===SEPARATOR) {

		html = `
		       <tr class="basicContext__item basicContext__item--separator"></tr>
		       `

	}

	return html

}

const renderPlaceholder = function() {

	return `<div class="basicContextContainer__placeholder"></div>`

}

const basicContext = class {

	constructor(e, items, opts = {}) {

		// Ensure correct binding
		this.dom     = this.dom.bind(this)
		this.active  = this.active.bind(this)
		this.visible = this.visible.bind(this)
		this.close   = this.close.bind(this)

		// Generate the id
		this.id = +new Date()

		// Save current overflow and block scrolling of site
		setOverflow()

		// Parse and validate items
		items.forEach((item, i) => items[i] = getParsedItem(item))

		// Render items
		let html = ''
		items.forEach((item, i) => html += renderItem(item, i))

		// Wrap context around items
		html = renderContext(this.id, html)

		// Add context to the body
		document.body.insertAdjacentHTML('beforeend', html)

		// Cache the context
		let context = this.dom()

		// Get the normalized click position
		let normalizedPosition = getNormalizedPosition(e)

		// Calculate position
		let position = getPosition(normalizedPosition, context)

		// Set styles and position
		if (typeof opts.show === 'function') opts.show(position, context)
		else                                 showContext(position, context)

		// Define the close function
		let close = null
		if (typeof opts.close === 'function') close = () => opts.close(this)
		else                                  close = () => this.close(this)

		// Bind events on context
		setContextEvents(close, context)

		// Bind events on items
		items.forEach((item) => setItemEvents(item, this.dom(`.basicContext__item[data-num='${ item.num }']`)))

		// Render placeholder when context is a sub-context
		if (opts.source!=null) {

			// Cache the container
			let container = this.dom().parentElement

			// Render placeholder and add new context to the body
			container.insertAdjacentHTML('beforeend', renderPlaceholder())

			// Cache the placeholder
			let placeholder = container.querySelector('.basicContextContainer__placeholder')

			// Set the position and size of the placeholder
			showPlaceholder(opts.source, placeholder)

			// Bind events on placeholder
			setPlaceholderEvents(close, placeholder, this)

		}

		// Do not trigger default event or further propagation
		if (typeof e.preventDefault === 'function')  e.preventDefault()
		if (typeof e.stopPropagation === 'function') e.stopPropagation()

		// Call callback when a function
		if (typeof opts.callback === 'function') opts.callback()

		return true

	}

	dom(elem = '') {

		return document.querySelector(`.basicContext[data-id='${ this.id }'] ${ elem }`)

	}

	active() {

		return (this.dom().parentElement.querySelector('.basicContext:hover')==null ? false : true)

	}

	visible() {

		let elem = this.dom()

		if (elem==null || elem.length===0) return false
		else                               return true

	}

	close() {

		if (this.visible()===false) return false

		let container = this.dom().parentElement

		container.parentElement.removeChild(container)

		// Reset overflow to its original value
		resetOverflow()

		return true

	}

}

return basicContext