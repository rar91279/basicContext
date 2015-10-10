import * as overflow from './overflow'
import * as coordinates from './coordinates'

import basicContextItem from './basicContextItem'
import objectAssign from 'object-assign'

export default function(e, items, opts = {}) {

	const parseOpts = function() {

		opts = objectAssign({}, opts)

		if (opts.class==null)  opts.class = ''
		if (opts.parent!=null) opts.class += ' basicContext--child'

		if (typeof opts.show !== 'function')     opts.show     = show
		if (typeof opts.close !== 'function')    opts.close    = close
		if (typeof opts.callback !== 'function') opts.callback = () => {}

		return true

	}

	const getOpts = function() {

		return opts

	}

	const setElem = function(newElem) {

		elem = newElem

		return true

	}

	const setEvents = function() {

		if (opts.parent==null) {

			elem.parentElement.onclick       = opts.close
			elem.parentElement.oncontextmenu = opts.close

		}

		elem.onmouseenter = () => {

			if (opts.child!=null) hideSub()

		}

		return true

	}

	const show = function() {

		elem.style.top             = `${ position.y }px`
		elem.style.left            = `${ position.x }px`
		elem.style.transformOrigin = `${ position.rx }px ${ position.ry }px`
		elem.style.opacity         = 1

		return true

	}

	const isActive = function() {

		return (elem.parentElement.querySelector(`.basicContext[data-id='${ id }']:hover`)==null ? false : true)

	}

	const isVisible = function() {

		if (elem==null || elem.length===0) return false
		else                               return true

	}

	const showSub = function(item) {

		let itemItems = item.getItems(),
		    itemElem  = item.getElem(),
		    itemSize  = itemElem.getBoundingClientRect()

		// Don't open a new child when a child is already visible
		if (opts.child!=null) return false

		const close = () => {

			if (opts.child!=null) {

				// Only close child when hovered item
				// is not the producer of the child
				if (item.isActive()===false) {

					// Remove highlight from item
					itemElem.classList.remove('basicContext__item--hover')

					opts.child.close()
					return true

				}

			} else {

				close()
				return true

			}

			return false

		}

		opts.child = basicContext({
			clientX : itemSize.left + itemSize.width,
			clientY : itemSize.top
		}, itemItems, {
			parent : exports(),
			close  : close
		})

		// Highlight current item
		itemElem.classList.add('basicContext__item--hover')

		return true

	}

	const hideSub = function() {

		if (opts.child==null)             return false
		if (opts.child.isActive()===true) return false

		if (opts.child.getOpts().close()===true) opts.child = null

		return true

	}

	const close = function() {

		if (isVisible()===false) return false

		let container = elem.parentElement

		// Close child first
		if (opts.child!=null) opts.child.close()

		if (opts.parent==null) container.parentElement.removeChild(container)
		else                   elem.parentElement.removeChild(elem)

		// Reset overflow to its original value
		overflow.reset()

		return true

	}

	const render = function() {

		let html  = ''

		// Render items
		items.forEach((item) => html += item.render())

		// Wrap context around items
		html = renderContext(id, opts, html)

		// Wrap container around context when context is not a child
		if (opts.parent==null) html = renderContainer(html)

		return html

	}

	const renderContext = function(id, opts, itemsHTML) {

		return `
		       <div class="basicContext ${ opts.class }" data-id="${ id }">
		           <table>
		               <tbody>
		                   ${ itemsHTML }
		               </tbody>
		           </table>
		       </div>
		       `

	}

	const renderContainer = function(contextHTML) {

		return `
		       <div class="basicContextContainer">
		           ${ contextHTML }
		       </div>
		       `

	}

	const exports = function() {

		return {
			getOpts,
			isActive,
			showSub,
			hideSub,
			close
		}

	}

	let position = null,
	    elem     = null,
	    id       = +new Date()

	parseOpts()

	// Save current overflow and block scrolling of site
	overflow.set()

	// Create items
	items = items.map((item, num) => {

		let parent = exports(),
		    opts   = { num, parent }

		return basicContextItem(item, opts)

	})

	// Render and add context to the body
	if (opts.parent==null) document.body.insertAdjacentHTML('beforeend', render())
	else                   document.querySelector('.basicContextContainer').insertAdjacentHTML('beforeend', render())

	// Select the newly created context and cache it
	setElem(document.querySelector(`.basicContext[data-id='${ id }']`))

	// Calculate position
	position = coordinates.get(e, elem)

	// Show the context
	opts.show()

	// Bind events on context
	setEvents()

	// Bind events on items
	items.forEach((item, i) => {

		let itemElem = elem.querySelector(`.basicContext__item[data-num='${ i }']`)

		item.setElem(itemElem)
		item.setEvents()

	})

	// Call callback when a function
	opts.callback()

	// Do not trigger default event or further propagation
	if (typeof e.preventDefault === 'function')  e.preventDefault()
	if (typeof e.stopPropagation === 'function') e.stopPropagation()

	return exports()

}