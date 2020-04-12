interface ArgumentInfo {
	label: string
	type: string
	description: string
	default?: any
	error?: string
	filter?: {
		fn: (result: any) => boolean
		error: string
	}
	oneOf?: string[]
	min?: number
	max?: number
}