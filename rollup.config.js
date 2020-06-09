/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: './src/popup/popup.ts',
    output: {
      file: 'out/popup.js',
      format: 'es'
    },
    plugins: [typescript()],
  },
  {
    input: './src/content-scripts/index.ts',
    output: {
      file: 'out/content.js',
      format: 'es'
    },
    plugins: [typescript()],
  },
  {
    input: './src/options/options.ts',
    output: {
      file: 'out/options.js',
      format: 'es'
    },
    plugins: [typescript()],
  }
]