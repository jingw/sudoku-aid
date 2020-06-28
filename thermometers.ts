import * as board_mode from "./board_mode.js";
import * as sudoku from "./sudoku.js";

export class Thermometers extends board_mode.SupportsConstruction<sudoku.Thermometer> {
    private readonly svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    constructor(private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number]) {
        super();
    }

    render(): SVGSVGElement {
        this.refresh();
        return this.svg;
    }

    refresh(): void {
        this.svg.innerHTML = "";
        for (const t of this.completed) {
            this.appendThermometer(t, false);
        }
        this.appendThermometer(this.underConstruction, true);
    }

    private appendThermometer(thermometer: sudoku.Thermometer, underConstruction: boolean): void {
        if (thermometer.length === 0) {
            return;
        }

        const bulb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const [x, y] = this.centerOfCell(thermometer[0]);
        bulb.setAttribute("cx", x.toString());
        bulb.setAttribute("cy", y.toString());
        bulb.setAttribute("r", "15");
        bulb.classList.add("thermometer");

        const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        line.classList.add("thermometer");
        for (const member of thermometer) {
            const pt = this.svg.createSVGPoint();
            [pt.x, pt.y] = this.centerOfCell(member);
            line.points.appendItem(pt);
        }

        if (underConstruction) {
            bulb.classList.add("under-construction");
            line.classList.add("under-construction");
        }

        this.svg.append(bulb);
        this.svg.append(line);
    }
}

export class AddMode extends board_mode.CoordinateCollectingBoardMode<sudoku.Thermometer> {
    name = "Add thermometer";

    constructor(thermometers: Thermometers) {
        super(thermometers);
    }

    protected finishConstruction(coordinates: readonly sudoku.Coordinate[]): sudoku.Thermometer {
        return coordinates;
    }
}

export class DeleteMode extends board_mode.CoordinateCollectingDeleteBoardMode<sudoku.Thermometer> {
    name = "Delete thermometer";

    constructor(thermometers: Thermometers) {
        super(thermometers);
    }
}
