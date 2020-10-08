/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// TODO: It might be nice to have this in React or similar.

import { Shortcut, Message, Shortcuts } from '../common/types'
import { fuzzyMatchScore } from '../common/fuzzyMatch'
import { $ } from '../common/builder'
import { getConfig } from '../common/storage'

const fuzzySearchShortcuts = (shortcuts: Shortcuts, query: string): Shortcuts => {
	const filtered: Shortcuts = []

	for (const shortcut of shortcuts) {
		const filteredItems = shortcut.items
			.map((item) => ({ item, score: fuzzyMatchScore(query, item.title) }))
			.filter(({ score }) => score >= 0)
			.sort((a, b) => b.score - a.score)
			.map(({ item }) => item)

		if (filteredItems.length) {
			filtered.push({
				description: shortcut.description,
				items: filteredItems,
				category: shortcut.category,
			})
		}
	}

	return filtered.sort((a, b) => fuzzyMatchScore(query, b.items[0].title) - fuzzyMatchScore(query, a.items[0].title))
}

const sendMessage = (message: Message) =>
	new Promise((resolve) =>
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
			chrome.tabs.sendMessage(tabs[0].id!, message, resolve),
		),
	)

const sendShortcutMessage = async (shortcut: Shortcut, focusFilterText: () => void, preserve: boolean) => {
	await sendMessage({ type: 'shortcut', value: shortcut })
	if (preserve) focusFilterText()
	else window.close()
}

/**
 * Adapted from Stack Overflow user `enigment`'s post on
 * https://stackoverflow.com/questions/635022/calculating-contrasting-colours-in-javascript/6511606#6511606
 */
const isLight = (color: string) => {
	const rgb = /rgb\((\d*), (\d*), (\d*)\)/.exec(color)
	if (rgb) {
		return 0.2126 * +rgb[1] + 0.7152 * +rgb[2] + 0.0722 * +rgb[3] > 165 // SMPTE C, Rec. 709 weightings
	}
}

const renderShortcuts = (container: HTMLElement, shortcuts: Shortcuts, focusFilterText: () => void) => {
	for (const shortcut of shortcuts) {
		const { category, items, description } = shortcut

		const categoryContainer = container.appendChild($('div'))
		categoryContainer.append($('h2', category))
		if (description) categoryContainer.append($('p', description))

		for (const item of items) {
			const labelButton = $('button', item.title)
			if (item.color) {
				labelButton.style.backgroundColor = item.color
				labelButton.style.color = isLight(item.color) ? '#000' : '#fff'
			}
			labelButton.addEventListener('click', (event) => sendShortcutMessage(item, () => {}, event.metaKey))
			labelButton.addEventListener('keydown', async (event) => {
				switch (event.key) {
					case 'Enter':
						event.preventDefault()
						await sendShortcutMessage(item, focusFilterText, event.metaKey)
						break
					case 'ArrowLeft':
						;(labelButton.previousElementSibling as HTMLButtonElement)?.focus()
						break
					case 'ArrowRight':
						;(labelButton.nextElementSibling as HTMLButtonElement)?.focus()
						break
					case 'ArrowUp':
						;(
							categoryContainer.previousElementSibling?.querySelector('button') ||
							rootContainer!.querySelector('input')
						)?.focus()
						break
					case 'ArrowDown':
						;(
							categoryContainer.nextElementSibling?.querySelector('button') ||
							rootContainer!.querySelector('a')
						)?.focus()
						break
				}
			})
			categoryContainer.append(labelButton)
		}
	}
}

const renderFilter = (
	container: HTMLElement,
	onChange: (filter: string, focusFilterText: () => void) => void,
	onSubmit: (preserve: boolean, focusFilterText: () => void) => void,
) => {
	container.append('Filter: ')
	const input = container.appendChild($('input'))
	const focusFilterText = () => {
		input.focus()
		input.setSelectionRange(0, input.value.length)
	}

	setTimeout(() => input.focus(), 15)
	input.addEventListener('keyup', () => onChange(input.value, focusFilterText))
	input.addEventListener('keydown', (e) => e.key === 'Enter' && onSubmit(e.metaKey, focusFilterText))

	onChange('', focusFilterText)
}

const renderCommands = (container: HTMLElement, data: Shortcuts) => {
	let filteredShortcuts: Shortcuts | undefined = undefined
	const onFilterChange = (filter: string, focusFilterText: () => void) => {
		while (resultsContainer.firstChild) {
			resultsContainer.removeChild(resultsContainer.firstChild)
		}
		filteredShortcuts = fuzzySearchShortcuts(data, filter)
		renderShortcuts(resultsContainer, filteredShortcuts, focusFilterText)
	}
	const onFilterSubmit = async (preserve: boolean, focusFilterText: () => void) => {
		if (!filteredShortcuts) return
		await sendShortcutMessage(filteredShortcuts[0].items[0], focusFilterText, preserve)
	}

	const filterContainer = container.appendChild($('div'))
	const resultsContainer = container.appendChild($('div'))
	renderFilter(filterContainer, onFilterChange, onFilterSubmit)
}

const linkButton = (title: string, onClick: () => void) => {
	const button = $('a', title)
	button.tabIndex = 0
	button.addEventListener('click', onClick)
	button.addEventListener('keydown', (e) => e.key === 'Enter' && onClick())
	return button
}

const renderScrapeButtons = (container: HTMLElement, hasData: boolean) => {
	container.appendChild($('hr'))
	if (hasData) {
		container.appendChild(
			linkButton('Refresh milestones', async () => {
				await sendMessage({ type: 'scrape', area: 'milestone' })
				window.close()
			}),
		)
		container.appendChild(
			linkButton('Refresh labels', async () => {
				await sendMessage({ type: 'scrape', area: 'label' })
				window.close()
			}),
		)
		container.appendChild(
			linkButton('Refresh assignees', async () => {
				await sendMessage({ type: 'scrape', area: 'assignee' })
				window.close()
			}),
		)
	} else {
		container.appendChild(
			linkButton('Load repo data', async () => {
				await sendMessage({ type: 'scrape' })
				window.close()
			}),
		)
	}
}

const renderOptionsLink = (container: HTMLElement) => {
	container.appendChild(
		linkButton('Settings', () => {
			window.open(chrome.runtime.getURL('src/options/options.html'))
			window.close()
		}),
	).id = 'settings-link'
}

const renderNoDataMessage = (container: HTMLElement) => {
	container.appendChild($('h2', 'No data for this repo'))
	container.appendChild($('p', 'Use the `Load repo data` link to begin.'))
}

const renderInactiveMessage = (container: HTMLElement) => {
	container.appendChild($('h2', 'This extension not active on this page.'))
	container.appendChild($('p', 'This extension is only active on `https://github.com/*/issues|pull/*`.'))
}

const rootContainer = document.getElementById('shortcuts')
if (!rootContainer) {
	throw Error('no container')
}

sendMessage({ type: 'init' })
	.then(async (repo) => {
		if (repo) {
			const repoConfig = (await getConfig())[repo as string]
			if (repoConfig) renderCommands(rootContainer, repoConfig)
			else renderNoDataMessage(rootContainer)
			renderScrapeButtons(rootContainer, !!repoConfig)
		} else {
			renderInactiveMessage(rootContainer)
		}
		renderOptionsLink(rootContainer)
	})
	.catch(alert)
