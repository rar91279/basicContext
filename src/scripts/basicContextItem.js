import objectAssign from 'object-assign'

const ITEM      = 'ITEM',
      SEPARATOR = 'SEPARATOR'

export default class basicContextItem {

	constructor(item = {}, opts = {}) {

		item = objectAssign({}, item)
		opts = objectAssign({}, opts)

		this.item   = item
		this.opts   = opts
		this.elem   = null

		this.parse  = this.parse.bind(this)
		this.link   = this.link.bind(this)
		this.bind   = this.bind.bind(this)
		this.active = this.active.bind(this)
		this.render = this.render.bind(this)

		this.parse()

		return true

	}

	parse() {

		let item = this.item

		// Set default values
		if (item.type==null)    item.type    = (Object.keys(item).length===0 ? SEPARATOR : ITEM)
		if (item.content==null) item.content = 'Undefined'
		if (item.class==null)   item.class   = ''

		// Set default function when fn is missing
		if (typeof item.fn !== 'function') item.fn = () => {}

		// Add disabled class when item disabled
		if (item.disabled!==true) item.disabled = false
		if (item.disabled===true) item.class += ' basicContext__item--disabled'

		// Add invisible class when invisible
		if (item.visible!==false) item.visible = true
		if (item.visible===false) item.class += ' basicContext__item--invisible'

		let opts = this.opts

		if (opts.parent && opts.parent.constructor.name!=='basicContext') opts.parent = null

		return true

	}

	link(elem) {

		this.elem = elem

		return true

	}

	bind() {

		let item = this.item,
		    opts = this.opts,
		    elem = this.elem

		if (elem==null)           return false
		if (item.disabled===true) return false

		elem.onclick       = item.fn
		elem.oncontextmenu = item.fn

		if (item.items!=null) {

			let timeout = null

			elem.onmouseenter = () => {
				clearTimeout(timeout)
				timeout = setTimeout(() => opts.parent.showSub(item.items, this), 150)
			}

			elem.onmouseleave = () => {
				clearTimeout(timeout)
				opts.parent.hideSub()
			}

		}

		return true

	}

	active() {

		let opts = this.opts,
		    elem = this.elem

		return (elem.parentElement.querySelector(`.basicContext__item[data-num='${ opts.num }']:hover`)==null ? false : true)

	}

	render() {

		let item = this.item,
		    opts = this.opts

		if (item.type===ITEM) {

			return `
			       <tr class="basicContext__item ${ item.class }" data-num="${ opts.num }">
			           <td class='basicContext__data'>${ item.content }</td>
			       </tr>
			       `

		}

		if (item.type===SEPARATOR) {

			return `
			       <tr class="basicContext__item basicContext__item--separator"></tr>
			       `

		}

	}

}