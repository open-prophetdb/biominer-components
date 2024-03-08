export interface PathologyViewerProps {
    /**
     * @description        Dom id for openseadragon
     */
    id: string;
    /**
     * @description        A file url of dzi, such as https://openseadragon.github.io/example-images/highsmith/highsmith.dzi
     */
    tileSources: string;
    /**
     * @description        en_US or zh_CN
     * @default            en_US
     */
    locale?: string; // en_US, zh_CN
    /**
     * @description        A url for icons
     * @default            https://cdn.jsdelivr.net/npm/openseadragon@2.4/build/openseadragon/images/
     */
    prefixUrl?: string;
    /**
     * @description        Whether show navigator?
     * @default            true
     */    
    showNavigator?: boolean;
    /**
     * @description        Degrees
     * @default            0
     */   
    degrees?: number;
    /**
     * @description        Whether show rotation control?
     * @default            true
     */       
    showRotationControl?: boolean;
    /**
     * @description        CSS style
     * @default            undefined
     */           
    style?: React.CSSProperties;
}