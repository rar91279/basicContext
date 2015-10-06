let overflow = null

export const set = function() {

	if (overflow!=null) return false

	overflow = document.body.style.overflow
	document.body.style.overflow = 'hidden'

	return true

}

export const reset = function() {

	if (overflow==null) return false

	document.body.style.overflow = overflow
	overflow = null

	return true

}