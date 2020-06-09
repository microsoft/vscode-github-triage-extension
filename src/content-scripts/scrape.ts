/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getConfig, setConfig } from '../common/storage'
import { expectClickable, getCurrentRepo, awaitClickable } from './utils'
import { delay, labelShortcut, assignShortcut, milestoneShortcut } from '../common/utils'
import { Shortcuts } from '../common/types'

export const scrape = async (area?: 'milestone' | 'assignee' | 'label') => {
	console.log('scraping data for area', area)

	const repoData: Shortcuts = [
		{
			category: 'Labels',
			items:
				!area || area === 'label'
					? (await scrapeLabels()).map((label) => labelShortcut(label.label, label.color))
					: [],
		},
		{
			category: 'Assignees',
			items:
				!area || area === 'assignee'
					? (await scrapeAssignees()).map((assignee) => assignShortcut(assignee.login, assignee.name))
					: [],
		},
		{
			category: 'Milestones',
			items:
				!area || area === 'milestone'
					? (await scrapeMilestones()).map((milestone) => milestoneShortcut(milestone))
					: [],
		},
	]

	const config = await getConfig()
	const currentRepo = getCurrentRepo()
	if (config[currentRepo]) {
		if (area) {
			const newData = repoData.find((x) => x.items.length)
			if (!newData) {
				console.error('no items found')
			} else {
				const category = newData.category
				const existing = config[currentRepo].findIndex((x) => x.category === category)
				if (existing !== -1) {
					config[currentRepo][existing] = newData
				} else {
					config[currentRepo].push(newData)
				}
			}
		} else {
			alert(
				'Data has been written to console. Use `Configure` in the extension popup to edit your existing configuration',
			)
		}
		console.log(JSON.stringify(repoData, null, 2))
	} else {
		config[currentRepo] = repoData
		alert('Data has been imported. Open the extension popup to begin.')
	}
	await setConfig(config)
}

const scrapeMilestones = async () => {
	const milestoneButton = expectClickable(document.querySelector('#milestone-select-menu summary'))
	milestoneButton.click()

	await awaitClickable(
		() =>
			document.querySelectorAll(
				'#milestone-select-menu tab-container .select-menu-list .select-menu-item-heading',
			)[0],
	)

	const milestones: string[] = []
	document
		.querySelector('#milestone-select-menu tab-container .select-menu-list')
		?.querySelectorAll('.select-menu-item-heading')
		.forEach((item) => {
			const text: string = (item as any).innerText
			if (!text.includes('assign to new milestone')) milestones.push(text)
		})
	milestoneButton.click()
	await delay(200)
	return milestones
}

const scrapeAssignees = async () => {
	const assigneeButton = expectClickable(document.querySelector('#assignees-select-menu summary'))
	assigneeButton.click()
	await awaitClickable(() => document.querySelectorAll('.sidebar-assignee .select-menu-item-heading')[0])
	const assignees: { login: string; name: string }[] = []
	document.querySelectorAll('.sidebar-assignee .select-menu-item-heading').forEach((item) => {
		assignees.push({
			login: (item.querySelector('.js-username') as any).innerText,
			name: (item.querySelector('.js-description') as any).innerText,
		})
	})
	assigneeButton.click()
	await delay(200)
	return assignees
}

const scrapeLabels = async () => {
	const labelButton = expectClickable(document.querySelector('#labels-select-menu summary'))
	labelButton.click()
	await awaitClickable(() => document.querySelectorAll('.label-select-menu-item .select-menu-item-text')[0])
	const labels: { label: string; color: string }[] = []
	document.querySelectorAll('.label-select-menu-item .select-menu-item-text').forEach((item) => {
		labels.push({
			label: (item.children[2].querySelector('.name') as any).innerText,
			color: (item.children[1] as any).style.backgroundColor,
		})
	})
	labelButton.click()
	await delay(200)
	return labels
}
