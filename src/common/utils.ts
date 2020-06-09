/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Shortcut } from './types'

export const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const error = (msg: string, ...args: any[]) => {
	console.error('Args:', ...args)
	throw new Error(msg)
}

export const expectDefined = <T>(a: T | null | undefined): T => a ?? error('expected defined', a)

export const labelShortcut = (label: string, color?: string): Shortcut => ({
	type: 'label',
	value: label,
	title: label,
	color,
})

export const assignShortcut = (assigneeLogin: string, assigneeName?: string): Shortcut => ({
	type: 'assign',
	title: `${assigneeLogin} (${assigneeName})`,
	value: assigneeLogin,
	color: 'rgb(245, 222, 179)',
})

export const commentShortcut = (title: string, comment: string): Shortcut => ({
	type: 'comment',
	value: comment,
	color: 'rgb(234, 147, 227)',
	title,
})

export const milestoneShortcut = (milestone: string): Shortcut => ({
	type: 'milestone',
	title: milestone,
	value: milestone,
	color: 'rgb(255, 150, 150)',
})
