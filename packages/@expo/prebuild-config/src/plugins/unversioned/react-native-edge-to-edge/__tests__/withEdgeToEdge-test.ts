import { WarningAggregator, withAndroidStyles, withStringsXml } from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';

import { compileMockModWithResultsAsync } from '../../expo-system-ui/__tests__/mockMods';
import { withAndroidUserInterfaceStyle } from '../../expo-system-ui/withAndroidUserInterfaceStyle';
import {
  withEdgeToEdge,
  withConfigureEdgeToEdgeEnforcement,
  withEdgeToEdgeEnabledGradleProperties,
  withRestoreDefaultTheme,
  hasEnabledEdgeToEdge,
} from '../withEdgeToEdge';

jest.mock('@expo/config-plugins', () => {
  const plugins = jest.requireActual('@expo/config-plugins');
  return {
    ...plugins,
    WarningAggregator: { addWarningAndroid: jest.fn() },
  };
});

describe('withEdgeToEdge', () => {
  it('should add warnings when edgeToEdgeEnabled is not configured', () => {
    // @ts-ignore: jest
    const config: ExpoConfig = {
      edgeToEdgeEnabled: undefined,
    };
    // @ts-ignore: jest
    WarningAggregator.addWarningAndroid.mockImplementationOnce();
    withEdgeToEdge(config);
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledTimes(1);
  });

  it('should add warnings when edgeToEdgeEnabled is disabled', () => {
    // @ts-ignore: jest
    const config: ExpoConfig = {
      edgeToEdgeEnabled: false,
    };
    // @ts-ignore: jest
    WarningAggregator.addWarningAndroid.mockImplementationOnce();
    withEdgeToEdge(config);
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledTimes(1);
  });

  it('should not add warnings when edgeToEdgeEnabled is enabled', () => {
    // @ts-ignore: jest
    const config: ExpoConfig = {
      edgeToEdgeEnabled: true,
    };
    // @ts-ignore: jest
    WarningAggregator.addWarningAndroid.mockImplementationOnce();
    withEdgeToEdge(config);
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledTimes(0);
  });

  it('should configure gradle properties', async () => {
    const config: ExpoConfig = {
      edgeToEdgeEnabled: true,
      modResults: [],
    };
    // @ts-ignore: jest, Load the mods
    withEdgeToEdge(config);
    // @ts-ignore: jest, Apply the gradle mod to the config
    await config.mods.android.gradleProperties({ ...config });
    // @ts-ignore: jest, The results should be updated
    expect(config.modResults).toMatchInlineSnapshot(`
      [
        {
          "type": "comment",
          "value": "Whether the app is configured to use edge-to-edge via the application config or \`react-native-edge-to-edge\` plugin",
        },
        {
          "key": "expo.edgeToEdgeEnabled",
          "type": "property",
          "value": "true",
        },
      ]
    `);
  });

  it('should configure styles when edge to edge is enabled and remove android:windowOptOutEdgeToEdgeEnforcement', async () => {
    const config: ExpoConfig = {
      edgeToEdgeEnabled: true,
      // @ts-ignore: jest
      modResults: {
        resources: {
          style: [
            {
              $: {
                name: 'AppTheme',
                parent: 'Theme.AppCompat.NoActionBar',
              },
              item: [
                {
                  $: {
                    name: 'android:windowTranslucentStatus',
                    value: 'true',
                  },
                },
                {
                  $: {
                    name: 'android:windowTranslucentNavigation',
                    value: 'true',
                  },
                },
              ],
            },
          ],
        },
      },
    };
    // @ts-ignore: jest, Load the mods
    withEdgeToEdge(config);
    // @ts-ignore: jest, Apply the gradle mod to the config
    await config.mods.android.styles(config);
    // @ts-ignore: jest, The results should be updated
    expect(config.modResults).toMatchInlineSnapshot(`
      {
        "resources": {
          "style": [
            {
              "$": {
                "name": "AppTheme",
                "parent": "Theme.EdgeToEdge",
              },
              "item": [
                {
                  "$": {
                    "name": "android:windowLightStatusBar",
                  },
                  "_": "true",
                },
              ],
            },
          ],
        },
      }
    `);
  });

  it('should restore styles when edge to edge is disabled and enable android:windowOptOutEdgeToEdgeEnforcement', async () => {
    const config: ExpoConfig = {
      edgeToEdgeEnabled: false,
      // @ts-ignore: jest
      modResults: {
        resources: {
          style: [
            {
              $: {
                name: 'AppTheme',
                parent: 'Theme.EdgeToEdge.NoActionBar',
              },
              item: [],
            },
          ],
        },
      },
    };
    // @ts-ignore: jest, Load the mods
    withEdgeToEdge(config);
    // @ts-ignore: jest, Apply the gradle mod to the config
    await config.mods.android.styles(config);
    // @ts-ignore: jest, The results should be updated
    expect(config.modResults).toMatchInlineSnapshot(`
      {
        "resources": {
          "style": [
            {
              "$": {
                "name": "AppTheme",
                "parent": "Theme.AppCompat.DayNight.NoActionBar",
              },
              "item": [
                {
                  "$": {
                    "name": "android:windowOptOutEdgeToEdgeEnforcement",
                    "tools:targetApi": "35",
                  },
                  "_": "true",
                },
              ],
            },
          ],
        },
      }
    `);
  });
});
