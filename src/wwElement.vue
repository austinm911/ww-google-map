<template>
  <div class="ww-map" :class="{ inactive: isEditing && !isError }">
      <div class="map-container">
          <div v-if="isError" class="map-placeholder" :class="{ error: isError }">
              <div class="placeholder-content">
                  If you want to use a Google map, you need to have a Google API Key. If you already have one, you can
                  add it in the map settings. <br /><br />
                  Otherwise you can follow theses instructions:
                  <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">
                      <button>API Key documentation</button>
                  </a>
                  <span v-if="wrongKey" class="wrongKey">Your API key has the wrong format</span>
              </div>
          </div>
          <div ref="map" class="map" :class="{ error: isError }"></div>
      </div>
  </div>
</template>

<script>
import { Loader } from './googleLoader';
import stylesConfig from './stylesConfig.json';

const DEFAULT_MARKER_NAME_FIELD = 'name';
const DEFAULT_MARKER_LAT_FIELD = 'lat';
const DEFAULT_MARKER_LNG_FIELD = 'lng';

export default {
  props: {
      /* wwEditor:start */
      wwEditorState: { type: Object, required: true },
      /* wwEditor:end */
      content: { type: Object, required: true },
      wwElementState: { type: Object, required: true },
  },
  emits: ['trigger-event', 'update:content:effect'],
  setup() {
      const markerInstances = [];
      return { markerInstances };
  },
  data() {
      return {
          map: null,
          loader: null,
          wrongKey: false,
          observer: null,
          mapLoaded: false,
      };
  },
  computed: {
      isEditing() {
          /* wwEditor:start */
          return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
          /* wwEditor:end */
          // eslint-disable-next-line no-unreachable
          return false;
      },
      isError() {
          if (this.content && this.content.googleKey) {
              return !this.isGoogleKeyMatch;
          }
          return true;
      },
      isGoogleKeyMatch() {
          if (this.content.googleKey) {
              return this.content.googleKey.match(/^(AIza[0-9A-Za-z-_]{35})$/);
          }
          return false;
      },
      mapOptions() {
          return {
              center: {
                  lat: parseFloat(this.content.lat || 0),
                  lng: parseFloat(this.content.lng || 0),
              },
              zoom: this.content.zoom,
              styles:
                  this.content.mapStyle === 'custom'
                      ? JSON.parse(this.content.mapStyleJSON.code)
                      : stylesConfig[this.content.mapStyle],
              mapTypeId: this.content.defaultMapType,
              zoomControl: this.content.zoomControl,
              scaleControl: this.content.scaleControl,
              rotateControl: this.content.rotateControl,
              streetViewControl: this.content.streetViewControl,
              fullscreenControl: this.content.fullscreenControl,
              mapTypeControl: this.content.mapTypeControl,
          };
      },
      markers() {
          const nameField = this.content.nameField || DEFAULT_MARKER_NAME_FIELD;
          const latField = this.content.latField || DEFAULT_MARKER_LAT_FIELD;
          const lngField = this.content.lngField || DEFAULT_MARKER_LNG_FIELD;

          if (!Array.isArray(this.content.markers)) return [];

          return this.content.markers.map(marker => ({
              content: wwLib.resolveObjectPropertyPath(marker, nameField),
              position: {
                  lat: parseFloat(wwLib.resolveObjectPropertyPath(marker, latField) || 0),
                  lng: parseFloat(wwLib.resolveObjectPropertyPath(marker, lngField) || 0),
              },
              rawData: marker,
          }));
      },
  },
  watch: {
      /* wwEditor:start */
      'content.googleKey'() {
          this.initMap();
      },
      'content.zoom'(value) {
          if (this.map) this.map.setZoom(value || 0);
      },
      'content.defaultMapType'(value) {
          if (value === 'satellite') this.$emit('update:content:effect', { mapStyle: null });
      },
      'content.fixedBounds'(value) {
          value ? this.setMapMarkerBounds() : this.initMap();
      },
      'wwEditorState.boundProps.markers'(isBind) {
          if (!isBind) this.$emit('update:content:effect', { nameField: null, latField: null, lngField: null });
      },
      /* wwEditor:end */
      markers() {
          this.updateMapMarkers();
      },
      mapOptions() {
          this.initMap();
      },
  },

  mounted() {
      this.initMap();

      // Fixed bound require the map to be visible
      this.observer = new IntersectionObserver(
          changes => {
              if (changes.some(change => change.isIntersecting) && this.content.fixedBounds) {
                  this.setMapMarkerBounds();
              }
          },
          { trackVisibility: true, delay: 100 }
      );
      this.observer.observe(this.$refs.map);
  },
  beforeUnmount() {
      this.observer.disconnect();
  },
  methods: {
      async initMap() {
          const { googleKey } = this.content;
          if (!this.isGoogleKeyMatch) {
              if (googleKey && googleKey.length) this.wrongKey = true;
              setTimeout(() => {
                  this.wrongKey = false;
              }, 8000);
              return;
          }

          this.wrongKey = false;
          if (!googleKey.length) return;

          if (!this.loader) {
              this.loader = new Loader({
                  apiKey: googleKey,
                  language: wwLib.wwLang.lang,
              });
              await this.loader.load();
          }

          try {
              this.map = new google.maps.Map(this.$refs.map, { ...this.mapOptions, zoom: this.content.zoom });
              this.map.addListener('click', mapsMouseEvent => {
                  mapsMouseEvent.latLng.lat = mapsMouseEvent.latLng.lat();
                  mapsMouseEvent.latLng.lng = mapsMouseEvent.latLng.lng();
                  this.$emit('trigger-event', {
                      name: 'map:click',
                      event: { ...mapsMouseEvent },
                  });
              });

              // Add idle event listener
              google.maps.event.addListenerOnce(this.map, 'idle', () => {
                  this.mapLoaded = true;
              });

              // Add idle event listener
              google.maps.event.addListener(
                  this.map,
                  'idle',
                  this.debounce(async () => {
                      if (!this.mapLoaded) {
                          this.mapLoaded = true;
                          return;
                      }

                      const bounds = this.map.getBounds();
                      const sw = bounds.getSouthWest();
                      const ne = bounds.getNorthEast();

                      const searchFilter = {
                          latLo: sw.lat(),
                          latHi: ne.lat(),
                          lonLo: sw.lng(),
                          lonHi: ne.lng(),
                      };

                      console.log(searchFilter);

                      // Emit the map:bounds_changed event
                      this.$emit('trigger-event', {
                          name: 'map:bounds_changed',
                          event: { bounds: searchFilter },
                      });
                  }, 2000)
              );

              this.updateMapMarkers();
          } catch (error) {
              wwLib.wwLog.error(error);
          }
      },
      async updateMapMarkers() {
          if (!this.markers || !this.loader) return;

          for (const markerInstance of this.markerInstances) {
              markerInstance.setMap(null);
          }

          this.markerInstances = [];

          for (const marker of this.markers) {
              try {
                  let _marker = new google.maps.Marker({
                      position: marker.position,
                      map: this.map,
                      animation: google.maps.Animation.DROP,
                  });
                  this.markerInstances.push(_marker);
                  if (marker.content) {
                      const infowindow = new google.maps.InfoWindow({
                          content: marker.content,
                          maxWidth: 200,
                      });
                      _marker.addListener('mouseover', e => {
                          this.$emit('trigger-event', {
                              name: 'marker:mouseover',
                              event: { marker, domEvent: e.domEvent },
                          });
                          if (this.content.markerTooltipTrigger === 'hover' && marker.content) {
                              infowindow.open(this.map, _marker);
                          }
                      });
                      _marker.addListener('mouseout', e => {
                          this.$emit('trigger-event', {
                              name: 'marker:mouseout',
                              event: { marker, domEvent: e.domEvent },
                          });
                          if (this.content.markerTooltipTrigger === 'hover') {
                              infowindow.close();
                          }
                      });
                      _marker.addListener('click', e => {
                          this.$emit('trigger-event', {
                              name: 'marker:click',
                              event: { marker, domEvent: e.domEvent },
                          });
                          if (this.content.markerTooltipTrigger === 'click' && marker.content) {
                              infowindow.open(this.map, _marker);
                          }
                      });
                  }
              } catch (error) {
                  wwLib.wwLog.error(error);
              }
          }

          if (this.content.fixedBounds) {
              this.setMapMarkerBounds();
          }
      },
      setMapMarkerBounds() {
          if (!this.map || this.markers.length < 2) return;
          const mapBounds = new google.maps.LatLngBounds();
          for (const marker of this.markers) {
              mapBounds.extend(marker.position);
          }
          this.map.fitBounds(mapBounds);
      },

      debounce(func, wait) {
          let lastCall = 0;
          return function (...args) {
              const context = this;
              const now = Date.now();
              if (now - lastCall > wait) {
                  lastCall = now;
                  return func.apply(context, args);
              }
          };
      },
      /* wwEditor:start */
      getMarkerTestEvent() {
          if (!this.markers.length) throw new Error('No markers found');
          return { marker: this.markers[0], domEvent: { x: 128, y: 156, target: null } };
      },
      /* wwEditor:end */
  },
};
</script>

<style lang="scss" scoped>
.ww-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 20%;
  pointer-events: initial;

  &.inactive {
      pointer-events: none;
  }

  .map-container {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;

      .map-iframe {
          width: 100%;
          height: 100%;
      }

      .map {
          z-index: 1;
          height: 100%;
          width: 100%;

          &.error {
              filter: blur(8px);
          }
      }
      .map-placeholder {
          z-index: 2;
          position: absolute;
          top: 0px;
          left: 0px;

          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          &.error {
              background-color: rgba(0, 0, 0, 0.4);
          }

          .placeholder-content {
              text-align: center;
              width: 90%;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0.8em 1.2em;
              border-radius: 12px;

              .wrongKey {
                  color: #f44336;
                  padding: 10px;
              }

              button {
                  margin-top: 20px;
                  padding: 0.8em 1.2em;
                  border: none;
                  border-radius: 12px;
                  background-color: #099af2;
                  color: white;
                  font-weight: 500;
                  font-size: 1.1em;
                  transition: 0.3s;

                  &:hover {
                      cursor: pointer;
                      background-color: #077ac0;
                      transition: 0.3s;
                  }
              }
          }
      }
  }
}
</style>
