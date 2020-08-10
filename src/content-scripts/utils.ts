/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { delay, error } from '../common/utils'

type Clickable = { click: () => void }

export const expectClickable = <T>(o: T): Clickable & T =>
	typeof (o as any)?.click === 'function' ? (o as Clickable & T) : error('expeted clickbale', o)

export const awaitClickable = async <T>(getter: () => T, tries = 25): Promise<(Clickable & T) | undefined> => {
	if (tries === 0) return undefined
	const value: any = getter()
	if (typeof value?.click === 'function') {
		return value as Clickable & T
	} else {
		await delay(200)
		return awaitClickable(getter, tries - 1)
	}
}

export const awaitFalsey = async (getter: () => any, tries = 25): Promise<void> => {
	if (tries === 0) return
	const value = getter()
	if (!value) {
		return
	} else {
		await delay(200)
		return awaitClickable(getter, tries - 1)
	}
}

export const getCurrentRepo = () =>
	/https:\/\/github.com\/([^/]*\/[^/]*)\/(?:issues|pull)\/\d*/.exec(window.location.href)?.[1]!
