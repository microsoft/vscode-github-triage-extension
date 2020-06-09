/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Message, Shortcut } from '../common/types'
import { scrape } from './scrape'
import { toggleAssignee, toggleLabel, addComment, toggleMilestone } from './toggle'
import { getCurrentRepo } from './utils'

const runShortcut = async (shortcut: Shortcut) => {
	console.log('running shortcut', shortcut)

	switch (shortcut.type) {
		case 'assign':
			await toggleAssignee(shortcut.value)
			break
		case 'comment':
			await addComment(shortcut.value)
			break
		case 'label':
			await toggleLabel(shortcut.value)
			break
		case 'milestone':
			await toggleMilestone(shortcut.value)
			break
	}
}

chrome.runtime.onMessage.addListener(async (request: Message, _sender, sendResponse) => {
	switch (request.type) {
		case 'shortcut': {
			await runShortcut(request.value)
			break
		}
		case 'init': {
			const currentRepo = getCurrentRepo()
			console.log('got init request. responding', { currentRepo })
			sendResponse(currentRepo)
			break
		}
		case 'scrape':
			await scrape(request.area)
			break
	}
})
