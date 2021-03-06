import { Component, ViewChild } from '@angular/core';
import { PointStyle } from 'chart.js';
import { EdaChart } from '@eda/components/eda-chart/eda-chart';
import { EdaDialog, EdaDialogCloseEvent, EdaDialogAbstract } from '@eda/shared/components/shared-components.index';
import { EdaChartComponent } from '@eda/components/eda-chart/eda-chart.component';
import * as _ from 'lodash';

@Component({
    selector: 'app-chart-dialog',
    templateUrl: './chart-dialog.component.html'
})

export class ChartDialogComponent extends EdaDialogAbstract {
    @ViewChild('myEdaChart', { static: false }) myEdaChart: EdaChartComponent;

    public dialog: EdaDialog;
    public chart: EdaChart;
    public oldChart : EdaChart;


    public drops = {
        pointStyles: [],
        pointSizes: [],
        gridLines: [],
        direction: [],
        stacked: []
    };

    public pointStyle: any;
    public direction: any = { label: '', value: '' };
    public stacked: any;

    public series: any[] = [];
    public id: any;

    constructor() {
        super();

        this.dialog = new EdaDialog({
            show: () => this.onShow(),
            hide: () => this.onClose(EdaDialogCloseEvent.NONE),
            title: 'PROPIEDADES DEL GRAFICO'
        });

        this.drops.pointStyles = [
            { label: 'Puntos', value: 'circle' },
            { label: 'Triangulos', value: 'triangle' },
            { label: 'Rectangulos', value: 'rect' },
            { label: 'Cruces', value: 'cross' },
            { label: 'Estrella', value: 'star' },
            { label: 'Linia', value: 'line' }
        ];

        this.drops.gridLines = [
            { label: 'Mostrar', value: true },
            { label: 'Ocultar', value: false }
        ];

        this.drops.direction = [
            { label: 'Vertical', value: 'bar' },
            { label: 'Horizontal', value: 'horizontalBar' }
        ];

        this.drops.stacked = [
            { label: 'Sin apilar', value: false },
            { label: 'Apilar', value: true }
        ];
    }

    onShow(): void {
        this.chart = this.controller.params.chart;
        this.oldChart = _.cloneDeep(this.controller.params.chart);
        this.load();
    }

    load() {
        this.loadChartTypeProperties();
        this.loadChartColors();
    }

    loadChartColors() {
        const type = this.chart.chartType;
        switch (type) {
            case 'doughnut':
            case 'polarArea':
                if (this.chart.chartLabels) {
                    this.series = this.chart.chartLabels.map((c, inx) => ({
                        label: c,
                        bg: this.rgb2hex(this.chart.chartColors[0].backgroundColor[inx])
                    }));
                    this.chart.chartColors[0].backgroundColor = this.series.map(d => (this.hex2rgb(d.bg, 90)));
                }
                break;
            default:
                this.series = this.chart.chartDataset.map(dataset => ({
                    label: dataset.label,
                    bg: this.rgb2hex(dataset.backgroundColor),
                    border: dataset.borderColor
                }));
                this.chart.chartColors = this.series.map(s => ({ backgroundColor: this.hex2rgb(s.bg, 90), borderColor: s.border }));
                break;
        }
    }

    handleInputColor(event) {
        if (this.chart.chartDataset) {
            const newDatasets = [];
            const dataset = this.chart.chartDataset;
            for (let i = 0, n = dataset.length; i < n; i += 1) {
                if (dataset[i].label === event.label) {
                    dataset[i].pointBackgroundColor = this.hex2rgb(event.bg, 90);
                    dataset[i].pointBorderColor = 'rgb(255,255,255)';
                    dataset[i].backgroundColor = this.hex2rgb(event.bg, 90);
                    dataset[i].borderColor = this.hex2rgb(event.bg, 100);
                    this.chart.chartColors[i] = _.pick(dataset[i], ['pointBackgroundColor', 'pointBorderColor', 'backgroundColor', 'borderColor']);
                } else {
                    dataset[i].pointBackgroundColor = this.chart.chartColors[i].backgroundColor;
                    dataset[i].pointBorderColor = 'rgb(255,255,255)';
                    dataset[i].backgroundColor = this.chart.chartColors[i].backgroundColor;
                    dataset[i].borderColor = this.chart.chartColors[i].backgroundColor;
                    this.chart.chartColors[i] = _.pick(dataset[i], ['pointBackgroundColor', 'pointBorderColor', 'backgroundColor', 'borderColor']);
                }
                newDatasets.push(dataset[i]);
            }
            this.chart.chartDataset = newDatasets;
        } else {
            if (this.chart.chartLabels) {
                const labels = this.chart.chartLabels;
                for (let i = 0, n = labels.length; i < n; i += 1) {
                    if (labels[i] === event.label) {
                        this.chart.chartColors[0].backgroundColor[i] = this.hex2rgb(event.bg, 90);
                    }
                }
                this.myEdaChart.updateChart();
            }
        }

    }



    rgb2hex(rgb): string {
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? '#' +
            ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ('0' + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
    }

    hex2rgb(hex, opacity = 100): string {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    }

    loadChartTypeProperties() {
        switch (this.chart.chartType) {
            case 'bar':
                if (_.startsWith(this.chart.chartType, 'bar')) {
                    this.direction = { label: 'Vertical', value: 'bar' };
                }
                break;
            case 'horizontalBar':
                this.direction = { label: 'Horizontal', value: 'horizontalBar' };
                break;
            case 'line':
                this.pointStyle = _.find(this.drops.pointStyles, key =>
                    key.value === _.get(this.chart.chartOptions, 'elements.point.pointStyle')
                );
                break;
            case 'doughnut':
            case 'polarArea':
                break;
        }
    }

    uniformizeStyle() {
        if (this.chart.chartDataset) {
            const newDatasets = [];
            const dataset = this.chart.chartDataset;
            for (let i = 0, n = dataset.length; i < n; i += 1) {

                dataset[i].pointBackgroundColor = this.chart.chartColors[i].backgroundColor;
                dataset[i].pointBorderColor = 'rgb(255,255,255)';
                dataset[i].backgroundColor = this.chart.chartColors[i].backgroundColor;
                dataset[i].borderColor = this.chart.chartColors[i].backgroundColor;
                this.chart.chartColors[i] = _.pick(dataset[i], ['pointBackgroundColor', 'pointBorderColor', 'backgroundColor', 'borderColor']);

                newDatasets.push(dataset[i]);
            }
            this.chart.chartDataset = newDatasets;
        }
    }

    onChangeDirection() {
    }

    onChangePointStyles(newStyle: PointStyle) {
        this.pointStyle = _.find(this.drops.pointStyles, o => o.value = newStyle);
        this.chart.chartOptions.elements.point.pointStyle = newStyle;
        this.myEdaChart.updateChartOptions(this.chart.chartOptions);
    }

    onChangeGridLines() {

    }

    onChangeStacked() {

    }

    //On save update styles and send current state
    saveChartConfig() {
        this.uniformizeStyle();
        this.onClose(EdaDialogCloseEvent.UPDATE, this.chart);
    }

    //On cancel send prev state
    closeChartConfig() {
        this.onClose(EdaDialogCloseEvent.NONE), this.oldChart;
    }

    onClose(event: EdaDialogCloseEvent, response?: any): void {
        this.myEdaChart.updateChart();
        return this.controller.close(event, response);
    }

}
