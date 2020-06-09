/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { defaultConfig } from './defaultConfig'
import { Config } from './types'

export const getConfig = () =>
	new Promise<Config>((resolve) =>
		chrome.storage.local.get({ repoConfigs: defaultConfig }, (items) => resolve(items.repoConfigs)),
	)

export const setConfig = (config: Config) =>
	new Promise((resolve) => chrome.storage.local.set({ repoConfigs: config }, resolve))
