/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const fuzzyMatchScore = (needle: string, haystack: string) => {
	const memo = Array.from({ length: needle.length + 1 }).map(() =>
		Array.from({ length: haystack.length + 1 }).map(() => [undefined, undefined]),
	)

	const derivedData = {
		memo,
		needle,
		haystack,
		needle_lower: needle.toLowerCase(),
		haystack_lower: haystack.toLowerCase(),
		importantIndicies: haystack.split('').map((_, i, arr) => {
			const prior = arr[i - 1]
			const current = arr[i]
			return (
				prior === undefined ||
				prior === ' ' ||
				prior === '-' ||
				prior === '(' ||
				prior === '*' ||
				prior === '~' ||
				(prior === prior.toLowerCase() && current === current.toUpperCase())
			)
		}),
	}

	return doFuzzyMatchScore(derivedData, 0, 0, 0)
}

const doFuzzyMatchScore = (
	data: {
		memo: (number | undefined)[][][]
		needle: string
		haystack: string
		needle_lower: string
		haystack_lower: string
		importantIndicies: boolean[]
	},
	needleOffset: number,
	haystackOffset: number,
	consecutive: number,
): number => {
	if (data.memo[needleOffset]?.[haystackOffset]?.[consecutive] !== undefined) {
		return data.memo[needleOffset][haystackOffset][consecutive]!
	}

	const options = []
	const matchBonus = consecutive + (data.importantIndicies[haystackOffset] ? 1 : 0)

	// Endgame.
	if (needleOffset === data.needle.length) {
		// bonus for ending together
		return haystackOffset === data.haystack.length ? 1 : 0
	}

	// Match. Advance both.
	if (
		data.needle[needleOffset].toUpperCase() === data.needle[needleOffset] &&
		data.needle[needleOffset] === data.haystack[haystackOffset]
	) {
		options.push(2 + matchBonus + doFuzzyMatchScore(data, needleOffset + 1, haystackOffset + 1, 1))
	} else if (data.needle_lower[needleOffset] === data.haystack_lower[haystackOffset]) {
		options.push(1 + matchBonus + doFuzzyMatchScore(data, needleOffset + 1, haystackOffset + 1, 1))
	}

	// Skip forward in haystack.
	if (haystackOffset < data.haystack.length) {
		options.push(doFuzzyMatchScore(data, needleOffset, haystackOffset + 1, 0))
	}

	// Allow skipping in needle for typos, but heavily penalize
	options.push(-5 + doFuzzyMatchScore(data, needleOffset + 1, haystackOffset, 0))

	return (data.memo[needleOffset][haystackOffset][consecutive] = Math.max(...options))
}
