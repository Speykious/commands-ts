interface ArgumentInfo {
	label: string
	type: string
	description: string
	default?: any
	filter: () => {}
	error?: string
	oneOf?: string[]
	min?: number
	max?: number
}