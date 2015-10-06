import * as overflow from './overflow'
import * as coordinates from './coordinates'

import basicContextItem from './basicContextItem'
import objectAssign from 'object-assign'

export default class basicContext {

	constructor(e, items, opts = {}) {

		items = items.slice()
		opts  = objectAssign({}, opts)

		this.id       = null
		this.items    = items
		this.opts     = opts
		this.position = null
		this.elem     = null

		this.parse   = this.parse.bind(this)
		this.active  = this.active.bind(this)
		this.visible = this.visible.bind(this)
		this.close   = this.close.bind(this)
		this.show    = this.show.bind(this)
		this.showSub = this.showSub.bind(this)
		this.hideSub = this.hideSub.bind(this)
		this.close   = this.close.bind(this)

		// Generate the id of the context
		let id = this.id = +new Date()

		// Parse the options
		this.parse()

		// Save current overflow and block scrolling of site
		overflow.set()

		// Create items
		items.forEach((item, num) => {

			let parent = this,
			    opts   = { num, parent }

			items[num] = new basicContextItem(item, opts)

		})

		// Render and add context to the body
		if (opts.parent==null) document.body.insertAdjacentHTML('beforeend', this.render())
		else                   document.querySelector('.basicContextContainer').insertAdjacentHTML('beforeend', this.render())

		// Select the newly created context
		let elem = this.elem = document.querySelector(`.basicContext[data-id='${ id }']`)

		// Cache the context
		this.link(elem)

		// Calculate position
		let position = this.position = coordinates.get(e, elem)

		// Show the context
		opts.show()

		// Bind events on context
		this.bind()

		// Bind events on items
		items.forEach((item, i) => {

			let elem = this.elem.querySelector(`.basicContext__item[data-num='${ i }']`)

			item.link(elem)
			item.bind()

		})

		// Call callback when a function
		opts.callback()

		// Do not trigger default event or further propagation
		if (typeof e.preventDefault === 'function')  e.preventDefault()
		if (typeof e.stopPropagation === 'function') e.stopPropagation()

		return true

	}

	parse() {

		let opts = this.opts

		if (opts.parent && opts.parent.constructor.name!=='basicContext') opts.parent = null

		if (opts.class==null) opts.class = ''
		if (opts.parent!=null) opts.class += ' basicContext--child'

		if (typeof opts.show !== 'function')     opts.show     = this.show
		if (typeof opts.close !== 'function')    opts.close    = this.close
		if (typeof opts.callback !== 'function') opts.callback = () => {}

		return true

	}

	link(elem) {

		this.elem = elem

		return true

	}

	bind() {

		let elem = this.elem,
		    opts = this.opts

		if (opts.parent==null) {

			elem.parentElement.onclick       = opts.close
			elem.parentElement.oncontextmenu = opts.close

		}

		elem.onmouseenter = () => {

			if (opts.child!=null) this.hideSub()

		}

		return true

	}

	show() {

		let elem     = this.elem,
		    position = this.position

		elem.style.top             = `${ position.y }px`
		elem.style.left            = `${ position.x }px`
		elem.style.transformOrigin = `${ position.rx }px ${ position.ry }px`
		elem.style.opacity         = 1

		return true

	}

	showSub(items, item) {

		let opts     = this.opts,
		    itemSize = item.elem.getBoundingClientRect()

		// Don't open a new child when a child is already visible
		if (opts.child!=null) return false

		let close = () => {

			if (opts.child!=null) {

				// Only close child when hovered item
				// is not the producer of the child
				if (item.active()===false) {

					// Remove highlight from item
					item.elem.classList.remove('basicContext__item--hover')

					opts.child.close()
					return true

				}

			} else {

				this.close()
				return true

			}

			return false

		}

		opts.child = new basicContext({
			clientX : itemSize.left + itemSize.width,
			clientY : itemSize.top
		}, items, {
			parent : this,
			close  : close
		})

		// Highlight current item
		item.elem.classList.add('basicContext__item--hover')

		return true

	}

	hideSub() {

		let opts = this.opts

		if (opts.child==null)           return false
		if (opts.child.active()===true) return false

		if (opts.child.opts.close()===true) opts.child = null

		return true

	}

	active() {

		let id   = this.id,
		    elem = this.elem

		return (elem.parentElement.querySelector(`.basicContext[data-id='${ id }']:hover`)==null ? false : true)

	}

	visible() {

		let elem = this.elem

		if (elem==null || elem.length===0) return false
		else                               return true

	}

	close() {

		if (this.visible()===false) return false

		let opts      = this.opts,
		    elem      = this.elem,
		    container = elem.parentElement

		// Close child first
		if (opts.child!=null) opts.child.close()

		if (opts.parent==null) container.parentElement.removeChild(container)
		else                   elem.parentElement.removeChild(elem)

		// Reset overflow to its original value
		overflow.reset()

		return true

	}

	render() {

		let id    = this.id,
		    items = this.items,
		    opts  = this.opts,
		    html  = ''

		// Render items
		items.forEach((item) => html += item.render())

		// Wrap context around items
		html = this.renderContext(id, opts, html)

		// Wrap container around context when context is not a child
		if (opts.parent==null) html = this.renderContainer(html)

		return html

	}

	renderContext(id, opts, itemsHTML) {

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

	renderContainer(contextHTML) {

		return `
		       <div class="basicContextContainer">
		           ${ contextHTML }
		       </div>
		       `

	}

}