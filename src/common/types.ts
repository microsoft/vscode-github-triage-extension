/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export type Shortcut = {
	title: string
	color?: string
	type: 'label' | 'comment' | 'assign' | 'milestone'
	value: string
}

export type Message =
	| { type: 'shortcut'; value: Shortcut }
	| { type: 'init' }
	| { type: 'log'; args: any }
	| { type: 'scrape'; area?: 'milestone' | 'assignee' | 'label' }

export type Shortcuts = {
	category: string
	description?: string
	items: Shortcut[]
}[]

export type Config = { [repo: string]: Shortcuts }
