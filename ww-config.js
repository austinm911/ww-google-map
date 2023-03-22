export default {
  options: {
      sizable: true,
  },
  editor: {
      label: {
          fr: 'Map',
          en: 'Map',
      },
      icon: 'map',
      customSettingsPropertiesOrder: [
          'googleKey',
          ['lat', 'lng', 'zoom'],
          ['markers', 'hintFields', 'nameField', 'latField', 'lngField', 'markerTooltipTrigger', 'fixedBounds'],
          [
              'zoomControl',
              'scaleControl',
              'rotateControl',
              'streetViewControl',
              'fullscreenControl',
              'mapTypeControl',
          ],
      ],
  },
  triggerEvents: [
      {
          name: 'map:click',
          label: { en: 'On map click' },
          event: {
              latLng: {
                  lat: 48.84872727506581,
                  lng: 2.351657694024656,
              },
              domEvent: {},
              pixel: {
                  x: 474,
                  y: 196,
              },
              xb: {
                  x: 129.67228991575087,
                  y: 88.07977939599527,
              },
          },
          default: true,
      },
      {
          name: 'marker:mouseover',
          label: { en: 'On marker mouse enter' },
          event: {
              marker: {
                  content: 'Paris',
                  position: {
                      lat: 48.84872727506581,
                      lng: 2.351657694024656,
                  },
                  rawData: {},
              },
              domEvent: { x: 128, y: 156, target: null },
          },
          getTestEvent: 'getMarkerTestEvent',
      },
      {
          name: 'marker:mouseout',
          label: { en: 'On marker mouse leave' },
          event: {
              marker: {
                  content: 'Paris',
                  position: {
                      lat: 48.84872727506581,
                      lng: 2.351657694024656,
                  },
                  rawData: {},
              },
              domEvent: { x: 128, y: 156, target: null },
          },
          getTestEvent: 'getMarkerTestEvent',
      },
      {
          name: 'marker:click',
          label: { en: 'On marker click' },
          event: {
              marker: {
                  content: 'Paris',
                  position: {
                      lat: 48.84872727506581,
                      lng: 2.351657694024656,
                  },
                  rawData: {},
              },
              domEvent: { x: 128, y: 156, target: null },
          },
          getTestEvent: 'getMarkerTestEvent',
      },
      {
          name: 'map:bounds_changed',
          label: { en: 'On Map Bounds Change' },
          event: {
              bounds: {
                  latLo: 33.55,
                  latHi: 34.084,
                  lonLo: -119.085,
                  lonHi: -117.890895,
              },
          },
          default: true,
      },
  ],
  properties: {
      defaultMapType: {
          label: {
              en: 'Map type',
              fr: 'Type de map',
          },
          type: 'TextSelect',
          options: {
              options: [
                  { value: 'roadmap', label: 'Standard' },
                  { value: 'satellite', label: 'Satellite' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'terrain', label: 'Terrain' },
              ],
          },
          defaultValue: 'roadmap',
      },
      mapStyle: {
          hidden: content => content.defaultMapType === 'satellite',
          label: {
              en: 'Map style',
              fr: 'Style de la map',
          },
          type: 'TextSelect',
          options: {
              options: [
                  { value: null, label: 'Standard' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'retro', label: 'Retro' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'night', label: 'Night' },
                  { value: 'aubergine', label: 'Aubergine' },
                  { value: 'custom', label: 'Custom Import' },
              ],
          },
          defaultValue: 'dark',
      },
      mapStyleJSON: {
          hidden: content => content.mapStyle !== 'custom' || content.defaultMapType === 'satellite',
          label: {
              en: 'JSON Import',
              fr: 'Import JSON',
          },
          type: 'Script',
      },
      googleKey: {
          section: 'settings',
          label: { en: 'Google key', fr: 'Clé Google' },
          type: 'Text',
          options: {
              placeholder: 'Google API key',
          },
          defaultValue: '',
          bindable: true,
          /* wwEditor:start */
          bindingValidation: {
              type: 'string',
              tooltip: 'A string that represents the API key: `"key********************"`',
          },
          /* wwEditor:end */
      },
      lat: {
          section: 'settings',
          label: { en: 'Latitude origin', fr: 'Origine - Latitude' },
          type: 'Text',
          options: {
              placeholder: 'Latitude',
          },
          defaultValue: '40.712784',
          bindable: true,
          /* wwEditor:start */
          bindingValidation: {
              type: 'string',
              tooltip: 'A string that defines the latitue: `"40.712784"`',
          },
          /* wwEditor:end */
      },
      lng: {
          section: 'settings',
          label: { en: 'Longitude origin', fr: 'Origine - Longitude' },
          type: 'Text',
          options: {
              placeholder: 'Longitude',
          },
          defaultValue: '-74.005941',
          bindable: true,
          /* wwEditor:start */
          bindingValidation: {
              type: 'string',
              tooltip: 'A string that defines the longitude: `"15.347554"`',
          },
          /* wwEditor:end */
      },
      latLo: {
          section: 'settings',
          label: { en: 'Latitude Low Boundary' },
          type: 'Text',
          options: {
              placeholder: 'Latitude Low',
          },
          defaultValue: '33.55',
          bindable: true,
      },
      latHi: {
          section: 'settings',
          label: { en: 'Latitude High Boundary' },
          type: 'Text',
          options: {
              placeholder: 'Latitude High',
          },
          defaultValue: '34.084',
          bindable: true,
      },
      lonLo: {
          section: 'settings',
          label: { en: 'Longitude Low Boundary' },
          type: 'Text',
          options: {
              placeholder: 'Longitude Low',
          },
          defaultValue: '-119.085',
          bindable: true,
      },
      lonHi: {
          section: 'settings',
          label: { en: 'Longitude High Boundary' },
          type: 'Text',
          options: {
              placeholder: 'Longitude High',
          },
          defaultValue: '-117.890895',
          bindable: true,
      },        
      zoom: {
          section: 'settings',
          type: 'Number',
          label: { en: 'Zoom', fr: 'Zoom' },
          options: {
              min: 0,
              max: 20,
              step: 1,
          },
          defaultValue: 11,
          bindable: true,
          /* wwEditor:start */
          bindingValidation: {
              type: 'number',
              tooltip: 'A number that defines the zoom: `11`',
          },
          /* wwEditor:end */
      },
      markers: {
          section: 'settings',
          label: { en: 'Markers', fr: 'Markers' },
          bindable: true,
          type: 'Array',
          options: {
              item: {
                  type: 'Object',
                  defaultValue: { name: '', lat: 0, lng: 0 },
                  options: {
                      item: {
                          name: {
                              label: { en: 'Name' },
                              type: 'Text',
                              options: { placeholder: 'Value' },
                          },
                          lat: {
                              label: { en: 'Latitude' },
                              type: 'Text',
                              options: { placeholder: 'Latitude' },
                          },
                          lng: {
                              label: { en: 'Longitude' },
                              type: 'Text',
                              options: { placeholder: 'Longitude' },
                          },
                      },
                  },
              },
          },
          defaultValue: [
              { name: 'New York', lat: 40.712784, lng: -74.005941 },
              { name: 'Brooklin', lat: 40.650002, lng: -73.949997 },
          ],
          /* wwEditor:start */
          bindingValidation: {
              type: 'array',
              tooltip:
                  'A collection of data in array format: \n\n `[{}, {}, ...] || ["string1", "string2", ...] || [1, 2, ...]`',
          },
          /* wwEditor:end */
      },
      hintFields: {
          hidden: (content, sidepanelContent, boundProps) => !boundProps.markers || content.markers,
          label: {
              en: 'Marker fields',
              fr: 'Champs du marker',
          },
          type: 'Info',
          options: {
              text: { en: 'Please provide at least one marker to configure fields' },
          },
          editorOnly: true,
          section: 'settings',
      },
      nameField: {
          hidden: (content, sidepanelContent, boundProps) => !boundProps.markers || !content.markers,
          label: {
              en: 'Marker name field',
              fr: 'Marker name field',
          },
          type: 'ObjectPropertyPath',
          options: content => {
              if (!content.markers.length || typeof content.markers[0] !== 'object') {
                  return null;
              }

              return { object: content.markers[0] };
          },
          defaultValue: null,
          section: 'settings',
      },
      latField: {
          hidden: (content, sidepanelContent, boundProps) => !boundProps.markers || !content.markers,
          label: {
              en: 'Marker lat. field',
              fr: 'Marker lat. field',
          },
          type: 'ObjectPropertyPath',
          options: content => {
              if (!content.markers.length || typeof content.markers[0] !== 'object') {
                  return null;
              }

              return { object: content.markers[0] };
          },
          defaultValue: null,
          section: 'settings',
      },
      lngField: {
          hidden: (content, sidepanelContent, boundProps) => !boundProps.markers || !content.markers,
          label: {
              en: 'Marker long. field',
              fr: 'Marker long. field',
          },
          type: 'ObjectPropertyPath',
          options: content => {
              if (!content.markers.length || typeof content.markers[0] !== 'object') {
                  return null;
              }

              return { object: content.markers[0] };
          },
          defaultValue: null,
          section: 'settings',
      },
      markerTooltipTrigger: {
          label: {
              en: 'Marker tooltip trigger',
              fr: 'Déclencheur infobox',
          },
          type: 'TextSelect',
          options: {
              options: [
                  { value: null, label: 'None' },
                  { value: 'hover', label: 'Hover' },
                  { value: 'click', label: 'Click' },
              ],
          },
          defaultValue: 'hover',
          section: 'settings',
      },
      fixedBounds: {
          label: { en: 'Fixed markers bounds', fr: 'Fixed markers bounds' },
          type: 'OnOff',
          section: 'settings',
          defaultValue: true,
      },
      zoomControl: {
          label: { en: 'Zoom control', fr: 'Zoom control' },
          type: 'OnOff',
          section: 'settings',
          defaultValue: true,
      },
      scaleControl: {
          label: { en: 'Scale control', fr: 'Scale control' },
          type: 'OnOff',
          section: 'settings',
          defaultValue: true,
      },
      rotateControl: {
          label: { en: 'Rotate control', fr: 'Rotate control' },
          type: 'OnOff',
          section: 'settings',
          defaultValue: true,
      },
      streetViewControl: {
          label: { en: 'Street View control', fr: 'Street View control' },
          type: 'OnOff',
          section: 'settings',
          defaultValue: true,
      },
      fullscreenControl: {
          label: { en: 'Fullscreen control', fr: 'Fullscreen control' },
          type: 'OnOff',
          section: 'settings',
          defaultValue: true,
      },
      mapTypeControl: {
          label: { en: 'Map Type control', fr: 'Map Type control' },
          type: 'OnOff',
          section: 'settings',
          defaultValue: true,
      },
  },
};
