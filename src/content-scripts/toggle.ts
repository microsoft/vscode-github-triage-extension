/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { expectClickable, awaitClickable, awaitFalsey } from './utils'
import { expectDefined, delay } from '../common/utils'

const toggleMenu = async (menuSelector: string, itemsSelector: string, target: string) => {
	const menuButton = expectClickable(document.querySelector(menuSelector))
	menuButton.click()
	document.querySelectorAll('[data-filterable-for="assignee-filter-field"] .octocat-spinner')
	await delay(100)
	await awaitFalsey(
		() => document.querySelector('[data-filterable-for="assignee-filter-field"] .octocat-spinner'),
		-1,
	)
	const itemButton = await awaitClickable(() => {
		for (const item of document.querySelectorAll(itemsSelector)) {
			if (item.textContent === target) {
				return item
			}
		}
	})
	if (!itemButton) {
		alert('Item not found')
		return
	}
	await delay(100)
	itemButton.click()
	await delay(100)
	menuButton.click()
}

export const toggleLabel = (label: string) =>
	toggleMenu('#labels-select-menu summary', '#labels-select-menu .name', label)

export const toggleMilestone = (milestone: string) =>
	toggleMenu('#milestone-select-menu summary', '#milestone-select-menu .select-menu-item-heading', milestone)

export const toggleAssignee = (assignee: string) =>
	toggleMenu('#assignees-select-menu summary', '.select-menu-item-heading > .js-username', assignee)

export const addComment = async (text: string) => {
	const field = expectDefined(document.getElementById('new_comment_field')) as HTMLTextAreaElement
	const prior = field.value ?? ''
	field.value = (prior ? `${prior}\n` : '') + text
	field.focus()
	field.setSelectionRange(field.value.length, field.value.length)

	const submitButton = expectDefined(document.getElementById('partial-new-comment-form-actions')) as HTMLButtonElement
	submitButton.disabled = false
}
