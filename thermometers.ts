import * as sudoku from "./sudoku.js";

export class Thermometers {
    readonly completed: sudoku.Thermometer[] = [];
    underConstruction: sudoku.Coordinate[] = [];
    readonly addMode = new AddMode(this);
    readonly deleteMode = new DeleteMode(this);

    private readonly svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    constructor(private centerOfCell: ([r, c]: sudoku.Coordinate) => [number, number]) {}

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

    finishConstruction(): void {
        if (this.underConstruction.length > 0) {
            this.completed.push(this.underConstruction);
            this.underConstruction = [];
            this.refresh();
        }
    }

    deleteLastAt(r: number, c: number): void {
        for (let i = this.completed.length - 1; i >= 0; i--) {
            if (sudoku.coordinatesContains(this.completed[i], [r, c])) {
                this.completed.splice(i, 1);
                this.refresh();
                return;
            }
        }
    }

    appendToCurrent(r: number, c: number): void {
        if (sudoku.coordinatesContains(this.underConstruction, [r, c])) {
            // refuse to add duplicates
            return;
        }
        this.underConstruction.push([r, c]);
        this.refresh();
    }
}

export class AddMode {
    constructor(private thermometers: Thermometers) {}

    onMouseDown(r: number, c: number): void {
        this.thermometers.appendToCurrent(r, c);
    }

    onDrag(r: number, c: number): void {
        this.thermometers.appendToCurrent(r, c);
    }
}

export class DeleteMode {
    constructor(private thermometers: Thermometers) {}

    onMouseDown(r: number, c: number): void {
        this.thermometers.deleteLastAt(r, c);
    }

    onDrag(): void {
        // only handle deletion on click
    }
}
