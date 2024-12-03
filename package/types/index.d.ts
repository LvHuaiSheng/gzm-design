import { App } from 'leafer-ui';

type IgnoreObj = {
    innerId: number;
};
type Config = {
    enabled?: boolean;
    alignLineMargin?: number;
    alignLineWidth?: number;
    signSize?: number;
    alignLineColor?: string;
};
declare const defaultConfig: Config;
declare class GuideLines {
    private readonly app;
    config: Config;
    private verticalLines;
    private horizontalLines;
    private activeObj;
    private dirty;
    private canvasLeafer;
    ignoreObjList: IgnoreObj[];
    private readonly clearGuidelineBound;
    private readonly drawGuideLinesBound;
    private readonly movingRenderBound;
    private readonly movingEndBound;
    constructor(app: App, config?: Config);
    private movingRender;
    private movingEnd;
    private mouseUp;
    setDefaultConfig(config?: Partial<Config>): Config;
    get enabled(): boolean;
    set enabled(value: boolean);
    private containsValueArr;
    private containsValue;
    private objectMoving;
    private clearLinesMeta;
    private getObjDraggingObjCoords;
    private getObjMaxWidthHeightByCoords;
    private omitCoords;
    private isInRange;
    private getCoords;
    private getCenterPoint;
    private calcCenterPointByACoords;
    private traversAllObjects;
    private snap;
    private drawSign;
    private drawLine;
    private drawVerticalLine;
    private drawHorizontalLine;
    private drawGuideLines;
    private clearGuideline;
    private getZoom;
    dispose(): void;
}

export { GuideLines, defaultConfig };
