import React, { useState, useEffect } from 'react';
import OpenSeadragon from 'openseadragon';
import getLocale from './locales/index';
import { PathologyViewerLocale } from './locales/index.t';
import { PathologyViewerProps } from './index.t';
import './index.less';

const PathologyViewer: React.FC<PathologyViewerProps> = (props) => {
  const { style, locale, id, prefixUrl, tileSources, showNavigator, degrees, showRotationControl } =
    props;

  const defaultPrefixUrl: string =
    'https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/';
  const [localeData, setLocaleData] = useState<PathologyViewerLocale>(getLocale('en_US'));

  useEffect(() => {
    if (locale) {
      setLocaleData(getLocale(locale));
    }
  }, [locale]);

  useEffect(() => {
    console.log('Test: ', id, tileSources);
    OpenSeadragon({
      id: id,
      prefixUrl: prefixUrl !== undefined ? prefixUrl : defaultPrefixUrl,
      tileSources: tileSources,
      showNavigator: showNavigator !== undefined ? showNavigator : true,
      // Initial rotation angle
      degrees: degrees !== undefined ? degrees : 0,
      // Show rotation buttons
      showRotationControl: showRotationControl !== undefined ? showRotationControl : false,
    });
  }, [id, prefixUrl, tileSources, showNavigator, degrees, showRotationControl]);

  return (
    <div className="pathology-viewer" style={style}>
      <div id={id} className="pathology-viewer__container"></div>
    </div>
  );
};
export default PathologyViewer;
