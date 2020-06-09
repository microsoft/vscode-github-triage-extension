/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { expect } from 'chai'
import { fuzzyMatchScore } from './fuzzyMatch'

describe('Fuzzy Match', () => {
	it('Does basic stuff', () => {
		expect(fuzzyMatchScore('qwerty', 'zxcvb')).to.be.lessThan(0)
		expect(fuzzyMatchScore('qwerty', 'qwerty')).to.be.greaterThan(0)
	})

	it('gives more weight to "special index" matches', () => {
		expect(fuzzyMatchScore('jake', 'JacksonKearl (Jackson Kearl)')).to.be.greaterThan(
			fuzzyMatchScore('jake', 'jrieken (Johannes Rieken)'),
		)
	})
})
